// 学习计划数据 - 按阶段组织，循序渐进学习
export const studyPlans = [
  {
    id: 1,
    name: '备孕准备阶段',
    icon: '',
    desc: '科学备孕，迎接新生命',
    stages: [
      {
        name: '第一阶段：备孕基础',
        desc: '了解备孕必备知识',
        lessons: [
          { title: '备孕前体检清单', slug: 'pre-pregnancy-checklist' },
          { title: '叶酸怎么补？', slug: 'folic-acid-guide' },
          { title: '排卵期计算方法', slug: 'ovulation-calculation' },
          { title: '备孕饮食营养指南', slug: 'pre-pregnancy-nutrition' },
        ],
      },
      {
        name: '第二阶段：身体调理',
        desc: '调理身体，提高受孕率',
        lessons: [
          { title: '如何调理月经周期', slug: 'menstrual-cycle-regulation' },
          { title: '改善精子卵子质量', slug: 'sperm-egg-quality' },
          { title: '备孕运动计划', slug: 'pre-pregnancy-exercise' },
          { title: '备孕心理压力调适', slug: 'pre-pregnancy-stress' },
        ],
      },
    ],
  },
  {
    id: 2,
    name: '孕期呵护阶段',
    icon: '🤰',
    desc: '安心度过孕期每一天',
    stages: [
      {
        name: '第一阶段：孕早期（1-12周）',
        desc: '关键器官发育期',
        lessons: [
          { title: '孕早期注意事项', slug: 'early-pregnancy-tips' },
          { title: '孕吐缓解方法', slug: 'morning-sickness-relief' },
          { title: '孕期用药安全', slug: 'pregnancy-medication-safety' },
          { title: '孕早期饮食指南', slug: 'early-pregnancy-diet' },
        ],
      },
      {
        name: '第二阶段：孕中期（13-27周）',
        desc: '舒适期，胎教开始',
        lessons: [
          { title: '孕中期产检时间表', slug: 'mid-pregnancy-checkup' },
          { title: '胎教方法大全', slug: 'prenatal-education' },
          { title: '孕期运动指南', slug: 'pregnancy-exercise' },
          { title: '预防妊娠纹', slug: 'prevent-stretch-marks' },
        ],
      },
      {
        name: '第三阶段：孕晚期（28-40周）',
        desc: '待产准备',
        lessons: [
          { title: '孕晚期注意事项', slug: 'late-pregnancy-tips' },
          { title: '待产包清单', slug: 'hospital-bag-checklist' },
          { title: '临产征兆识别', slug: 'labor-signs' },
          { title: '分娩方式选择', slug: 'delivery-options' },
        ],
      },
    ],
  },
  {
    id: 3,
    name: '新生儿护理（0-1月）',
    icon: '👶',
    desc: '新手爸妈的第一课',
    stages: [
      {
        name: '第一阶段：出生后第一周',
        desc: '适应新世界',
        lessons: [
          { title: '新生儿喂养指南', slug: 'newborn-feeding' },
          { title: '母乳喂养正确姿势', slug: 'breastfeeding-posture' },
          { title: '新生儿黄疸解读', slug: 'newborn-jaundice' },
          { title: '新生儿睡眠规律', slug: 'newborn-sleep' },
        ],
      },
      {
        name: '第二阶段：日常护理',
        desc: '洗澡、换尿布、脐带护理',
        lessons: [
          { title: '新生儿洗澡指南', slug: 'newborn-bathing' },
          { title: '脐带护理方法', slug: 'umbilical-cord-care' },
          { title: '换尿布正确方法', slug: 'diaper-changing' },
          { title: '拍嗝完全指南', slug: 'burping-guide' },
        ],
      },
    ],
  },
  {
    id: 4,
    name: '婴儿喂养（1-12月）',
    icon: '🍼',
    desc: '从母乳到辅食的过渡',
    stages: [
      {
        name: '第一阶段：纯奶期（1-6月）',
        desc: '母乳或配方奶为主',
        lessons: [
          { title: '母乳喂养完全指南', slug: 'breastfeeding-guide' },
          { title: '配方奶冲泡方法', slug: 'formula-preparation' },
          { title: '如何判断宝宝吃饱了', slug: 'baby-full-signs' },
          { title: '宝宝吐奶处理', slug: 'baby-spitup' },
        ],
      },
      {
        name: '第二阶段：辅食添加期（6-12月）',
        desc: '逐步引入固体食物',
        lessons: [
          { title: '辅食添加时间表', slug: 'solid-food-timeline' },
          { title: '6月龄辅食攻略', slug: '6-month-solid-food' },
          { title: '辅食过敏识别', slug: 'food-allergy' },
          { title: '自主进食训练', slug: 'self-feeding' },
        ],
      },
    ],
  },
  {
    id: 5,
    name: '婴幼儿健康（0-3岁）',
    icon: '💊',
    desc: '常见病预防与护理',
    stages: [
      {
        name: '第一阶段：疫苗接种',
        desc: '按时接种，建立免疫',
        lessons: [
          { title: '疫苗接种时间表', slug: 'vaccination-schedule' },
          { title: '疫苗常见问题', slug: 'vaccination-faq' },
          { title: '接种后护理', slug: 'post-vaccination-care' },
        ],
      },
      {
        name: '第二阶段：常见病护理',
        desc: '发烧、咳嗽、湿疹等',
        lessons: [
          { title: '宝宝发烧护理', slug: 'baby-fever-care' },
          { title: '宝宝咳嗽处理', slug: 'baby-cough-care' },
          { title: '宝宝湿疹护理', slug: 'baby-eczema-care' },
          { title: '宝宝便秘调理', slug: 'baby-constipation' },
        ],
      },
      {
        name: '第三阶段：急救知识',
        desc: '关键时刻能救命',
        lessons: [
          { title: '海姆立克急救法', slug: 'heimlich-maneuver' },
          { title: '烫伤应急处理', slug: 'burn-first-aid' },
          { title: '摔伤处理指南', slug: 'fall-injury-care' },
          { title: '高热惊厥应对', slug: 'febrile-seizure' },
        ],
      },
    ],
  },
  {
    id: 6,
    name: '产后恢复与月子',
    icon: '🏠',
    desc: '科学坐月子，恢复好身材',
    stages: [
      {
        name: '第一阶段：产后第一周',
        desc: '身体恢复关键期',
        lessons: [
          { title: '产后伤口护理', slug: 'postpartum-wound-care' },
          { title: '恶露观察指南', slug: 'lochia-guide' },
          { title: '产后饮食调理', slug: 'postpartum-diet' },
          { title: '产褥汗护理', slug: 'postpartum-sweating-guide' },
        ],
      },
      {
        name: '第二阶段：产后恢复',
        desc: '盆底肌恢复、身材管理',
        lessons: [
          { title: '盆底肌恢复训练', slug: 'pelvic-floor-recovery' },
          { title: '产后身材恢复', slug: 'postpartum-body-recovery' },
          { title: '预防产后抑郁', slug: 'prevent-postpartum-depression' },
          { title: '母乳喂养技巧', slug: 'breastfeeding-skills' },
        ],
      },
    ],
  },
  {
    id: 7,
    name: '宝宝心理发展（0-3岁）',
    icon: '🧠',
    desc: '培养健康心理，建立安全感',
    stages: [
      {
        name: '第一阶段：安全感建立（0-1岁）',
        desc: '依恋关系的关键期',
        lessons: [
          { title: '如何培养宝宝安全感', slug: 'baby-security' },
          { title: '宝宝哭声解读', slug: 'baby-crying' },
          { title: '亲子互动游戏', slug: 'parent-child-play' },
        ],
      },
      {
        name: '第二阶段：情绪管理（1-3岁）',
        desc: '引导情绪表达',
        lessons: [
          { title: '宝宝发脾气应对', slug: 'baby-temper-tantrum' },
          { title: '培养宝宝分享意识', slug: 'baby-sharing' },
          { title: '入园焦虑应对', slug: 'kindergarten-anxiety' },
        ],
      },
    ],
  },
];

// 学习进度存储键
export const PROGRESS_KEY = 'babywiki_study_progress';
export const QUIZ_KEY = 'babywiki_quiz_records';

// 获取学习进度
export function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
  } catch {
    return {};
  }
}

// 保存学习进度
export function saveProgress(planId, stageIndex, lessonIndex) {
  const progress = getProgress();
  const key = `${planId}-${stageIndex}`;
  if (!progress[key]) progress[key] = [];
  if (!progress[key].includes(lessonIndex)) {
    progress[key].push(lessonIndex);
  }
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

// 获取某阶段已完成课程数
export function getStageProgress(planId, stageIndex) {
  const progress = getProgress();
  const key = `${planId}-${stageIndex}`;
  return progress[key] ? progress[key].length : 0;
}

// 获取某计划总进度
export function getPlanProgress(planId) {
  const plan = studyPlans.find(p => p.id === planId);
  if (!plan) return { completed: 0, total: 0 };
  let completed = 0;
  let total = 0;
  plan.stages.forEach((stage, si) => {
    total += stage.lessons.length;
    completed += getStageProgress(planId, si);
  });
  return { completed, total };
}

// 标记课程为已学习
export function markLessonRead(planId, stageIndex, lessonIndex) {
  saveProgress(planId, stageIndex, lessonIndex);
}

// 检查课程是否已学习
export function isLessonRead(planId, stageIndex, lessonIndex) {
  const progress = getProgress();
  const key = `${planId}-${stageIndex}`;
  return progress[key] ? progress[key].includes(lessonIndex) : false;
}

// 重置某计划进度
export function resetPlanProgress(planId) {
  const progress = getProgress();
  const plan = studyPlans.find(p => p.id === planId);
  if (!plan) return;
  plan.stages.forEach((_, si) => {
    delete progress[`${planId}-${si}`];
  });
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}
