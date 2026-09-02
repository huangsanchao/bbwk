import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '../stores/user.js';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
    meta: { guest: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/articles',
    name: 'ArticleList',
    component: () => import('../views/ArticleListView.vue'),
  },
  {
    path: '/articles/:slug',
    name: 'ArticleDetail',
    component: () => import('../views/ArticleDetailView.vue'),
  },
  {
    path: '/categories',
    name: 'Categories',
    component: () => import('../views/ArticleListView.vue'),
  },
  {
    path: '/categories/:slug',
    name: 'Category',
    component: () => import('../views/CategoryView.vue'),
  },
  // 学习中心
  {
    path: '/study',
    name: 'StudyCenter',
    component: () => import('../views/StudyCenterView.vue'),
  },
  {
    path: '/study/:id',
    name: 'StudyPlan',
    component: () => import('../views/StudyPlanView.vue'),
  },
  {
    path: '/quiz/practice',
    name: 'QuizPractice',
    component: () => import('../views/QuizPracticeView.vue'),
  },
  {
    path: '/quiz/exam',
    name: 'QuizExam',
    component: () => import('../views/QuizExamView.vue'),
  },
  {
    path: '/quiz/records',
    name: 'QuizRecords',
    component: () => import('../views/QuizRecordsView.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isLoggedIn;

  // 需要登录的页面
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 已登录用户不能访问登录/注册页
  if (to.meta.guest && isAuthenticated) {
    return next({ name: 'Home' });
  }

  next();
});

export default router;
