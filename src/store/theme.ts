import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useThemeStore = defineStore('theme', () => {
  const isDark = ref(false);

  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      isDark.value = savedTheme === 'dark';
    } else {
      // 根据系统偏好设置默认主题
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
  };

  // 切换主题
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    applyTheme();
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  };

  // 应用主题
  const applyTheme = () => {
    const root = document.documentElement;
    if (isDark.value) {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
  };

  return {
    isDark,
    initTheme,
    toggleTheme,
    applyTheme
  };
});
