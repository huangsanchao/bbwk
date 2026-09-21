"""视频翻译：英文 → 中文
流程：提取音频 → Whisper转录 → 翻译 → 中文TTS → 合并视频
"""
import os
import sys

# 设置 FFmpeg 路径（Whisper 和 moviepy 都需要）
FFMPEG_BIN = r"C:\Users\admin\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin"
os.environ["PATH"] = FFMPEG_BIN + os.pathsep + os.environ.get("PATH", "")
os.environ["IMAGEIO_FFMPEG_EXE"] = os.path.join(FFMPEG_BIN, "ffmpeg.exe")

import json
import subprocess
import textwrap
from moviepy import VideoFileClip, AudioFileClip, CompositeAudioClip
import whisper
from edge_tts import Communicate
import asyncio

# ==================== 配置 ====================
INPUT_VIDEO = "财富.mp4"
OUTPUT_VIDEO = "财富_zh.mp4"
AUDIO_FILE = "temp_audio.wav"
TRANSCRIPT_FILE = "temp_transcript.json"
SRT_FILE = "temp_chinese.srt"
TTS_DIR = "temp_tts"

VOICE = "zh-CN-YunxiNeural"  # Edge TTS 中文男声
RATE = "+0%"
VOLUME = "+0%"

# 从 .env 读取 API Key
def load_env(path="server/.env"):
    env = {}
    if os.path.exists(path):
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env

_env = load_env()
DEEPSEEK_API_KEY = _env.get("DEEPSEEK_API_KEY", "")

# ==================== 1. 提取音频 ====================
def extract_audio():
    print("[1/5] 提取音频...")
    clip = VideoFileClip(INPUT_VIDEO)
    audio = clip.audio
    audio.write_audiofile(AUDIO_FILE, codec='pcm_s16le')
    clip.close()
    print(f"  OK 音频已提取: {AUDIO_FILE}")

# ==================== 2. Whisper 转录 ====================
def transcribe():
    print(" [2/5]: Whisper 转录英文字幕...")
    model = whisper.load_model("base")  # base 模型较快，够用
    result = model.transcribe(AUDIO_FILE, language="en", word_timestamps=True)

    segments = []
    for seg in result["segments"]:
        segments.append({
            "start": seg["start"],
            "end": seg["end"],
            "text_en": seg["text"].strip(),
        })

    with open(TRANSCRIPT_FILE, "w", encoding="utf-8") as f:
        json.dump(segments, f, ensure_ascii=False, indent=2)

    print(f"  OK 转录完成: {len(segments)} 段")
    return segments

# ==================== 3. 翻译 ====================
def translate_batch(texts):
    """用 DeepSeek API 批量翻译"""
    import requests

    batch_text = "\n---\n".join(texts)
    prompt = f"""将以下英文翻译成中文，保持专业金融语境。
只返回翻译结果，每行一句，顺序与输入一致。不要加编号或其他说明。

{batch_text}"""

    resp = requests.post(
        "https://api.deepseek.com/v1/chat/completions",
        headers={"Authorization": f"Bearer {DEEPSEEK_API_KEY}", "Content-Type": "application/json"},
        json={"model": "deepseek-chat", "messages": [{"role": "user", "content": prompt}], "temperature": 0.3},
        timeout=60,
    )
    resp.raise_for_status()
    content = resp.json()["choices"][0]["message"]["content"]
    return [line.strip() for line in content.strip().split("\n") if line.strip()]


def translate_segments(segments):
    print("  [3/5]: 翻译为中文...")
    os.makedirs(TTS_DIR, exist_ok=True)

    # 每 5 段一批翻译（控制 API 调用次数）
    BATCH = 5
    all_translated = []

    for i in range(0, len(segments), BATCH):
        batch = segments[i:i+BATCH]
        texts = [s["text_en"] for s in batch]
        print(f"  翻译 {i+1}-{min(i+BATCH, len(segments))}/{len(segments)}...")

        try:
            translated = translate_batch(texts)
            # 补齐长度
            while len(translated) < len(texts):
                translated.append(texts[len(translated)])
            for idx, t in enumerate(translated[:len(batch)]):
                batch[idx]["text_zh"] = t
        except Exception as e:
            print(f"  WARN 翻译失败，使用原文: {e}")
            for s in batch:
                s["text_zh"] = s["text_en"]

        all_translated.extend(batch)

    with open(TRANSCRIPT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_translated, f, ensure_ascii=False, indent=2)

    print(f"  OK 翻译完成")
    return all_translated

# ==================== 4. 中文 TTS ====================
async def generate_tts(segments):
    print(" [4/5] 生成中文语音...")
    os.makedirs(TTS_DIR, exist_ok=True)

    # 清理文本：移除 Edge TTS 不支持的字符
    import re
    def clean_text(text):
        # 移除 markdown 标记、特殊符号
        text = re.sub(r'[*_`~#]', '', text)
        # 移除多余空白
        text = re.sub(r'\s+', ' ', text).strip()
        # 只保留中英文、数字、基本标点
        text = re.sub(r'[^一-龥a-zA-Z0-9，。！？；：、""''（）【】《》.,!?;:()\[\] ]', '', text)
        return text.strip()

    for i, seg in enumerate(segments):
        text = clean_text(seg.get("text_zh", seg["text_en"]))
        if not text or len(text) < 2:
            continue

        tts_file = os.path.join(TTS_DIR, f"{i:04d}.mp3")
        if os.path.exists(tts_file):
            continue

        try:
            comm = Communicate(text, voice=VOICE, rate=RATE, volume=VOLUME)
            await comm.save(tts_file)
        except Exception as e:
            print(f"  WARN TTS 失败段落 {i}: {e}")
            continue
        print(f"  {i+1}/{len(segments)}: {text[:20]}...")

    print(f"  OK TTS 生成完成: {len(os.listdir(TTS_DIR))} 个文件")

# ==================== 5. 合并视频 ====================
def merge_video(segments):
    print("  [5/5]: 合并视频与中文配音...")

    clip = VideoFileClip(INPUT_VIDEO)
    original_audio = clip.audio

    from moviepy import concatenate_audioclips, AudioFileClip as AClip
    from moviepy.audio.AudioClip import AudioArrayClip
    import numpy as np

    AUDIO_FPS = 44100

    def make_silence(duration):
        if duration <= 0:
            return None
        samples = int(AUDIO_FPS * duration)
        arr = np.zeros((samples, 1), dtype=np.int16)
        return AudioArrayClip(arr, fps=AUDIO_FPS)

    # 策略：保留原音频（降音量做背景），中文 TTS 叠在对应时间段
    # 这样即使 TTS 时长不完全匹配，也不会影响整体同步

    tts_tracks = []  # (start_time, audio_clip)

    for i, seg in enumerate(segments):
        tts_file = os.path.join(TTS_DIR, f"{i:04d}.mp3")
        if not os.path.exists(tts_file):
            continue

        try:
            tts_clip = AClip(tts_file)
        except Exception:
            continue

        start = seg["start"]
        tts_tracks.append((start, tts_clip))

    print(f"  找到 {len(tts_tracks)} 段中文配音")

    if not tts_tracks:
        # 没有 TTS，直接输出原视频
        clip.write_videofile(
            OUTPUT_VIDEO, codec='libx264', audio_codec='aac',
            bitrate='4000k', audio_bitrate='192k', preset='fast', threads=4, logger='bar'
        )
        clip.close()
        print(f"  OK 视频已生成（无配音）: {OUTPUT_VIDEO}")
        return

    # 构建完整时间线的 TTS 音频
    # 按时间顺序排列，相邻段之间用静音填充
    tts_tracks.sort(key=lambda x: x[0])

    new_clips = []
    current_time = 0.0

    for start_time, tts_clip in tts_tracks:
        # 填充到当前段的开始位置
        if start_time > current_time + 0.01:  # 0.01s 容差
            silence = make_silence(start_time - current_time)
            if silence:
                new_clips.append(silence)

        new_clips.append(tts_clip)
        current_time = start_time + tts_clip.duration

    # 补齐到视频末尾
    if current_time < clip.duration:
        silence = make_silence(clip.duration - current_time)
        if silence:
            new_clips.append(silence)

    if new_clips:
        tts_audio = concatenate_audioclips(new_clips)

        # 裁剪到视频长度
        if tts_audio.duration > clip.duration:
            tts_audio = tts_audio.subclipped(0, clip.duration)

        # 原音频降音量做背景，TTS 做前景
        bg_audio = original_audio.with_volume_scaled(0.15)  # 原声 15%
        final_audio = CompositeAudioClip([bg_audio, tts_audio])
    else:
        final_audio = original_audio

    final_clip = clip.with_audio(final_audio)
    final_clip.write_videofile(
        OUTPUT_VIDEO,
        codec='libx264',
        audio_codec='aac',
        bitrate='4000k',
        audio_bitrate='192k',
        preset='fast',
        threads=4,
        logger='bar',
    )

    clip.close()
    final_audio.close()
    print(f"  OK 视频已生成: {OUTPUT_VIDEO}")

# ==================== 清理 ====================
def cleanup():
    print("\n[清理] 清理临时文件...")
    for f in [AUDIO_FILE, TRANSCRIPT_FILE, SRT_FILE]:
        if os.path.exists(f):
            os.remove(f)
    if os.path.exists(TTS_DIR):
        import shutil
        shutil.rmtree(TTS_DIR)
    print("  OK 清理完成")

# ==================== 主流程 ====================
if __name__ == "__main__":
    extract_audio()
    segments = transcribe()
    segments = translate_segments(segments)
    asyncio.run(generate_tts(segments))
    merge_video(segments)
    cleanup()
    print(f"\n全部完成！输出文件: {OUTPUT_VIDEO}")
