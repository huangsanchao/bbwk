import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', () => {
  const user = ref(null);
  const accessToken = ref(localStorage.getItem('accessToken') || '');
  const refreshToken = ref(localStorage.getItem('refreshToken') || '');

  const isLoggedIn = computed(() => !!accessToken.value);
  const nickname = computed(() => user.value?.nickname || user.value?.username || '');
  const avatar = computed(() => user.value?.avatar || '');
  const babyAge = computed(() => {
    if (!user.value?.babyInfo?.birthday) return null;
    const now = new Date();
    const birth = new Date(user.value.babyInfo.birthday);
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    return months >= 0 ? months : null;
  });

  function setUser(userData) {
    user.value = userData;
  }

  function setTokens(access, refresh) {
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  }

  function logout() {
    user.value = null;
    accessToken.value = '';
    refreshToken.value = '';
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoggedIn,
    nickname,
    avatar,
    babyAge,
    setUser,
    setTokens,
    logout,
  };
});
