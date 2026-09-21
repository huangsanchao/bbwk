"""
寓言故事视频生成：守株待兔
使用 Pillow 绘制场景 + edge-tts 配音 + MoviePy 合成
"""
import os
from PIL import Image, ImageDraw, ImageFont
from moviepy import VideoFileClip, ImageClip, concatenate_videoclips, AudioFileClip, CompositeAudioClip
import edge_tts
import asyncio

# ==================== 配置 ====================
OUTPUT_FILE = "守株待兔.mp4"
SCENE_DIR = "temp_scenes"
AUDIO_DIR = "temp_audio_stz"
os.makedirs(SCENE_DIR, exist_ok=True)
os.makedirs(AUDIO_DIR, exist_ok=True)

WIDTH, HEIGHT = 1280, 720
DURATION_PER_SCENE = 6  # 每场景秒数

# 中文字体（使用系统自带）
FONT_PATH = r"C:\Windows\Fonts\msyh.ttc"  # 微软雅黑

# ==================== 场景定义 ====================
scenes = [
    {
        "title": "守株待兔",
        "subtitle": "—— 中国古代寓言故事 ——",
        "bg_color": "#87CEEB",
        "text": "",
        "draw_func": "draw_title_scene",
    },
    {
        "title": "",
        "bg_color": "#90EE90",
        "text": "从前，有个农夫每天在田里辛勤耕作。",
        "draw_func": "draw_farmer_working",
    },
    {
        "title": "",
        "bg_color": "#98FB98",
        "text": "忽然，一只兔子慌不择路，一头撞在树桩上死了。",
        "draw_func": "draw_rabbit_collision",
    },
    {
        "title": "",
        "bg_color": "#FFD700",
        "text": "农夫白捡了一只兔子，高兴地回家美餐一顿。",
        "draw_func": "draw_happy_farmer",
    },
    {
        "title": "",
        "bg_color": "#DEB887",
        "text": "从此，他放下农具，整天守在树桩旁等待下一只兔子。",
        "draw_func": "draw_waiting_farmer",
    },
    {
        "title": "",
        "bg_color": "#D2B48C",
        "text": "可是再也没有兔子出现，他的田地也荒芜了。",
        "draw_func": "draw_abandoned_field",
    },
    {
        "title": "寓意",
        "bg_color": "#4682B4",
        "text": "不主动努力，只想靠运气获得成功，最终只会一无所获。",
        "draw_func": "draw_moral",
    },
]

# ==================== 绘图函数 ====================
def get_font(size):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except:
        return ImageFont.load_default()

def draw_title_scene(img, scene):
    """绘制标题场景"""
    draw = ImageDraw.Draw(img)

    # 背景渐变效果
    for y in range(HEIGHT):
        r = int(135 + (255 - 135) * y / HEIGHT)
        g = int(206 + (215 - 206) * y / HEIGHT)
        b = int(235 + (220 - 235) * y / HEIGHT)
        draw.rectangle([(0, y), (WIDTH, y + 1)], fill=(r, g, b))

    # 装饰圆圈
    draw.ellipse([WIDTH//2 - 120, HEIGHT//2 - 120, WIDTH//2 + 120, HEIGHT//2 + 120],
                 fill=(255, 255, 255, 180), outline=(255, 100, 100), width=3)

    # 标题
    font_large = get_font(72)
    font_small = get_font(28)

    title = scene["title"]
    subtitle = scene["subtitle"]

    bbox = draw.textbbox((0, 0), title, font=font_large)
    tw = bbox[2] - bbox[0]
    draw.text((WIDTH//2 - tw//2, HEIGHT//2 - 50), title, fill="#8B0000", font=font_large)

    bbox = draw.textbbox((0, 0), subtitle, font=font_small)
    tw = draw.textbbox((0, 0), subtitle, font=font_small)[2] - bbox[0]
    draw.text((WIDTH//2 - tw//2, HEIGHT//2 + 30), subtitle, fill="#555", font=font_small)

def draw_farmer_working(img, scene):
    """农夫在田里耕作"""
    draw = ImageDraw.Draw(img)

    # 天空
    draw.rectangle([0, 0, WIDTH, HEIGHT//3], fill="#87CEEB")
    # 太阳
    draw.ellipse([WIDTH-150, 30, WIDTH-50, 130], fill="#FFD700")
    # 田地
    draw.rectangle([0, HEIGHT//3, WIDTH, HEIGHT], fill="#90EE90")
    # 田垄
    for i in range(8):
        y = HEIGHT//3 + i * 40
        draw.line([(0, y), (WIDTH, y)], fill="#228B22", width=2)

    # 农夫（简化版）
    fx, fy = WIDTH//3, HEIGHT//2 + 50
    # 身体
    draw.ellipse([fx-15, fy-60, fx+15, fy-30], fill="#FDBCB4")  # 头
    draw.rectangle([fx-20, fy-30, fx+20, fy+30], fill="#8B4513")  # 身体
    draw.line([(fx, fy+30), (fx-15, fy+70)], fill="#333", width=4)  # 左腿
    draw.line([(fx, fy+30), (fx+15, fy+70)], fill="#333", width=4)  # 右腿
    # 锄头
    draw.line([(fx+20, fy-20), (fx+60, fy-50)], fill="#8B4513", width=3)
    draw.rectangle([fx+55, fy-60, fx+75, fy-45], fill="#888")

    # 文字
    font = get_font(36)
    draw.text((50, HEIGHT - 80), scene["text"], fill="#333", font=font)

def draw_rabbit_collision(img, scene):
    """兔子撞树桩"""
    draw = ImageDraw.Draw(img)

    # 背景
    draw.rectangle([0, 0, WIDTH, HEIGHT//2], fill="#87CEEB")
    draw.rectangle([0, HEIGHT//2, WIDTH, HEIGHT], fill="#90EE90")

    # 树桩
    tx, ty = WIDTH//2, HEIGHT//2 + 20
    draw.ellipse([tx-30, ty-40, tx+30, ty+40], fill="#8B4513")
    draw.ellipse([tx-25, ty-50, tx+25, ty-30], fill="#A0522D")

    # 兔子（撞晕状态）
    rx, ry = tx + 60, ty - 10
    # 身体
    draw.ellipse([rx-25, ry-15, rx+25, ry+15], fill="#FFF")
    # 耳朵
    draw.ellipse([rx-20, ry-35, rx-10, ry-10], fill="#FFF")
    draw.ellipse([rx+10, ry-35, rx+20, ry-10], fill="#FFF")
    # 眼睛（X表示晕了）
    draw.line([(rx-8, ry-8), (rx-2, ry-2)], fill="#F00", width=2)
    draw.line([(rx-8, ry-2), (rx-2, ry-8)], fill="#F00", width=2)
    draw.line([(rx+2, ry-8), (rx+8, ry-2)], fill="#F00", width=2)
    draw.line([(rx+2, ry-2), (rx+8, ry-8)], fill="#F00", width=2)
    # 撞击效果
    for i in range(3):
        draw.line([(tx+30+i*10, ty-20+i*5), (tx+50+i*10, ty-30+i*5)], fill="#FF0", width=2)

    # 文字
    font = get_font(36)
    draw.text((50, HEIGHT - 80), scene["text"], fill="#333", font=font)

def draw_happy_farmer(img, scene):
    """农夫高兴地拿着兔子"""
    draw = ImageDraw.Draw(img)

    # 背景 - 屋内
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill="#DEB887")
    # 窗户
    draw.rectangle([WIDTH-200, 50, WIDTH-50, 200], fill="#87CEEB", outline="#8B4513", width=5)
    draw.line([(WIDTH-125, 50), (WIDTH-125, 200)], fill="#8B4513", width=3)
    draw.line([(WIDTH-200, 125), (WIDTH-50, 125)], fill="#8B4513", width=3)

    # 农夫笑脸
    fx, fy = WIDTH//2 - 50, HEIGHT//2
    draw.ellipse([fx-30, fy-80, fx+30, fy-20], fill="#FDBCB4")  # 头
    draw.rectangle([fx-35, fy-20, fx+35, fy+40], fill="#8B4513")  # 身体
    # 笑脸
    draw.arc([fx-20, fy-60, fx+20, fy-30], 0, 180, fill="#333", width=3)
    draw.ellipse([fx-12, fy-55, fx-6, fy-49], fill="#333")  # 左眼
    draw.ellipse([fx+6, fy-55, fx+12, fy-49], fill="#333")  # 右眼

    # 兔子（被拎着）
    draw.ellipse([fx+50, fy-30, fx+90, fy+10], fill="#FFF")
    draw.line([(fx+35, fy-20), (fx+50, fy-10)], fill="#333", width=3)

    # 文字
    font = get_font(36)
    draw.text((50, HEIGHT - 80), scene["text"], fill="#333", font=font)

def draw_waiting_farmer(img, scene):
    """农夫守在树桩旁"""
    draw = ImageDraw.Draw(img)

    # 天空
    draw.rectangle([0, 0, WIDTH, HEIGHT//2], fill="#B0C4DE")
    # 田地（有些荒芜）
    draw.rectangle([0, HEIGHT//2, WIDTH, HEIGHT], fill="#D2B48C")

    # 树桩
    tx, ty = WIDTH//2 + 100, HEIGHT//2 + 30
    draw.ellipse([tx-30, ty-40, tx+30, ty+40], fill="#8B4513")

    # 农夫坐着等
    fx, fy = tx - 80, ty + 10
    draw.ellipse([fx-15, fy-50, fx+15, fy-20], fill="#FDBCB4")  # 头
    draw.rectangle([fx-20, fy-20, fx+20, fy+20], fill="#8B4513")  # 身体
    # 坐着
    draw.line([(fx, fy+20), (fx-20, fy+50)], fill="#333", width=4)
    draw.line([(fx, fy+20), (fx+30, fy+40)], fill="#333", width=4)

    # 废弃的农具
    draw.line([fx-100, fy+40, fx-60, fy+10], fill="#8B4513", width=3)

    # 文字
    font = get_font(36)
    draw.text((50, HEIGHT - 80), scene["text"], fill="#333", font=font)

def draw_abandoned_field(img, scene):
    """荒芜的田地"""
    draw = ImageDraw.Draw(img)

    # 天空（阴天）
    draw.rectangle([0, 0, WIDTH, HEIGHT//2], fill="#708090")
    # 荒芜的田地
    draw.rectangle([0, HEIGHT//2, WIDTH, HEIGHT], fill="#A0522D")
    # 枯草
    for i in range(20):
        x = 100 + i * 60
        y = HEIGHT//2 + 30
        draw.line([(x, y), (x-5, y-30)], fill="#556B2F", width=2)
        draw.line([(x, y), (x+5, y-25)], fill="#556B2F", width=2)

    # 空树桩
    tx, ty = WIDTH//2, HEIGHT//2 + 50
    draw.ellipse([tx-25, ty-35, tx+25, ty+35], fill="#654321")

    # 农夫失望离开
    fx, fy = WIDTH - 200, HEIGHT//2 + 20
    draw.ellipse([fx-15, fy-60, fx+15, fy-30], fill="#FDBCB4")
    draw.rectangle([fx-20, fy-30, fx+20, fy+20], fill="#8B4513")
    # 垂头丧气
    draw.line([(fx, fy+20), (fx-10, fy+60)], fill="#333", width=4)
    draw.line([(fx, fy+20), (fx+15, fy+55)], fill="#333", width=4)

    # 文字
    font = get_font(36)
    draw.text((50, HEIGHT - 80), scene["text"], fill="#FFF", font=font)

def draw_moral(img, scene):
    """寓意总结"""
    draw = ImageDraw.Draw(img)

    # 深蓝背景
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill="#1a1a2e")

    # 装饰框
    margin = 80
    draw.rectangle([margin, margin, WIDTH-margin, HEIGHT-margin],
                   outline="#FFD700", width=3)

    # 标题
    title_font = get_font(56)
    text_font = get_font(32)

    title = scene["title"]
    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    draw.text((WIDTH//2 - tw//2, 150), title, fill="#FFD700", font=title_font)

    # 寓意文字（分行）
    text = scene["text"]
    # 简单分行
    words = list(text)
    lines = []
    line = ""
    for w in words:
        test_line = line + w
        bbox = draw.textbbox((0, 0), test_line, font=text_font)
        if bbox[2] - bbox[0] > WIDTH - 200:
            lines.append(line)
            line = w
        else:
            line = test_line
    lines.append(line)

    y_start = 280
    for i, line_text in enumerate(lines):
        bbox = draw.textbbox((0, 0), line_text, font=text_font)
        tw = bbox[2] - bbox[0]
        draw.text((WIDTH//2 - tw//2, y_start + i * 50), line_text, fill="#FFF", font=text_font)

    # 底部装饰
    draw.text((WIDTH//2 - 100, HEIGHT - 100), "— 完 —", fill="#888", font=get_font(24))

# ==================== 生成场景图片 ====================
def generate_scenes():
    print("生成场景图片...")
    draw_functions = {
        "draw_title_scene": draw_title_scene,
        "draw_farmer_working": draw_farmer_working,
        "draw_rabbit_collision": draw_rabbit_collision,
        "draw_happy_farmer": draw_happy_farmer,
        "draw_waiting_farmer": draw_waiting_farmer,
        "draw_abandoned_field": draw_abandoned_field,
        "draw_moral": draw_moral,
    }

    for i, scene in enumerate(scenes):
        img = Image.new("RGB", (WIDTH, HEIGHT), scene["bg_color"])
        draw_func = draw_functions.get(scene["draw_func"])
        if draw_func:
            draw_func(img, scene)

        img_path = os.path.join(SCENE_DIR, f"scene_{i:02d}.png")
        img.save(img_path)
        print(f"  场景 {i+1}: {img_path}")

# ==================== 生成配音 ====================
async def generate_audio():
    print("生成中文配音...")
    voice = "zh-CN-YunxiNeural"  # 中文男声

    narrations = [
        "",  # 标题无配音
        "从前，有个农夫每天在田里辛勤耕作。",
        "忽然，一只兔子慌不择路，一头撞在树桩上死了。",
        "农夫白捡了一只兔子，高兴地回家美餐一顿。",
        "从此，他放下农具，整天守在树桩旁，等待下一只兔子。",
        "可是，再也没有兔子出现，他的田地也荒芜了。",
        "这个故事告诉我们：不主动努力，只想靠运气获得成功，最终只会一无所获。",
    ]

    for i, text in enumerate(narrations):
        if not text:
            continue
        audio_path = os.path.join(AUDIO_DIR, f"scene_{i:02d}.mp3")
        try:
            comm = edge_tts.Communicate(text, voice=voice)
            await comm.save(audio_path)
            print(f"  场景 {i+1}: {text[:20]}...")
        except Exception as e:
            print(f"  场景 {i+1} 配音失败: {e}")

# ==================== 合成视频 ====================
def create_video():
    print("合成视频...")

    clips = []

    for i, scene in enumerate(scenes):
        img_path = os.path.join(SCENE_DIR, f"scene_{i:02d}.png")
        audio_path = os.path.join(AUDIO_DIR, f"scene_{i:02d}.mp3")

        # 创建图片片段
        img_clip = ImageClip(img_path).with_duration(DURATION_PER_SCENE)
        clips.append(img_clip)

    # 添加配音
    print("添加配音轨道...")
    from moviepy import CompositeAudioClip, concatenate_audioclips

    audio_clips = []
    current_time = 0

    for i, scene in enumerate(scenes):
        audio_path = os.path.join(AUDIO_DIR, f"scene_{i:02d}.mp3")
        if os.path.exists(audio_path):
            try:
                # 验证文件是否有效
                import subprocess
                result = subprocess.run(
                    ['ffmpeg', '-i', audio_path, '-f', 'null', '-'],
                    capture_output=True, text=True, timeout=5
                )
                if result.returncode == 0 or 'Duration' in result.stderr:
                    audio_clip = AudioFileClip(audio_path)
                    if current_time > 0:
                        audio_clip = audio_clip.with_start(current_time)
                    audio_clips.append(audio_clip)
            except Exception as e:
                print(f"  跳过损坏的音频: scene_{i:02d}.mp3")

        current_time += clips[i].duration

    # 合并视频
    final_video = concatenate_videoclips(clips, method="compose")

    if audio_clips:
        final_audio = CompositeAudioClip(audio_clips)
        final_video = final_video.with_audio(final_audio)

    print("导出视频...")
    final_video.write_videofile(
        OUTPUT_FILE,
        codec='libx264',
        audio_codec='aac',
        fps=24,
        bitrate='4000k',
        audio_bitrate='192k',
        preset='fast',
        threads=4,
        logger='bar',
    )

    final_video.close()
    print(f"视频已生成: {OUTPUT_FILE}")

# ==================== 清理 ====================
def cleanup():
    import shutil
    print("\n清理临时文件...")
    for d in [SCENE_DIR, AUDIO_DIR]:
        if os.path.exists(d):
            shutil.rmtree(d)
    print("完成!")

# ==================== 主流程 ====================
if __name__ == "__main__":
    generate_scenes()
    asyncio.run(generate_audio())
    create_video()
    cleanup()
