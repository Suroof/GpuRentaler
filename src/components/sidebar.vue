<template>
  <div class="sidebar">
    <el-menu
        class="sidebar-el-menu"
        :default-active="onRoutes"
        :collapse="sidebar.collapse"
        :background-color="sidebarBgColor"
        :text-color="sidebarTextColor"
        :active-text-color="sidebarActiveColor"
        unique-opened
        router
    >
      <template v-for="item in items">
        <template v-if="item.subs">
          <el-sub-menu :index="item.index" :key="item.index">
            <template #title>
              <el-icon>
                <component :is="item.icon"></component>
              </el-icon>
              <span>{{ item.title }}</span>
            </template>
            <template v-for="subItem in item.subs">
              <el-sub-menu
                  v-if="subItem.subs"
                  :index="subItem.index"
                  :key="subItem.index"
              >
                <template #title>
                  <el-icon>
                    <component :is="subItem.icon"></component>
                  </el-icon>
                  {{ subItem.title }}
                </template>
                <el-menu-item v-for="(threeItem, i) in subItem.subs" :key="i" :index="threeItem.index">
                  <el-icon>
                    <component :is="threeItem.icon"></component>
                  </el-icon>
                  {{ threeItem.title }}
                </el-menu-item>
              </el-sub-menu>
              <el-menu-item v-else :index="subItem.index">
                <el-icon>
                  <component :is="subItem.icon"></component>
                </el-icon>
                {{ subItem.title }}
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item :index="item.index" :key="item.index">
            <el-icon>
              <component :is="item.icon"></component>
            </el-icon>
            <template #title>{{ item?.title }}</template>
          </el-menu-item>
        </template>
      </template>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import {computed, ref} from 'vue';
import {useSidebarStore} from '../store/sidebar';
import {useThemeStore} from '../store/theme';
import {useRoute} from 'vue-router';
import {getMenus} from "../api/resource";

interface MenuItem {
  index: string;
  icon: string;
  title: string;
  subs: MenuItem[] | undefined;
}

const items = ref<MenuItem[]>([]);
const themeStore = useThemeStore();

// 根据主题设置菜单颜色
const sidebarBgColor = computed(() => {
  return themeStore.isDark ? 'rgba(0, 0, 0, 0.95)' : '#ffffff';
});

const sidebarTextColor = computed(() => {
  return themeStore.isDark ? '#cccccc' : '#606266';
});

const sidebarActiveColor = computed(() => {
  return themeStore.isDark ? '#ffffff' : '#409eff';
});

getMenus().then(res => {
  items.value = getDataNode(res.data, 1);
});

const getDataNode: any = (menus: any[], parentId: number) => {
  return menus.filter(m => m.parentId === parentId).map((menu: any) => {
    let subs: MenuItem[] = getDataNode(menus, menu.id);
    return {
      index: menu.url,
      icon: menu.icon,
      title: menu.name,
      subs: subs?.length === 0 ? undefined : subs
    }
  });
}

const route = useRoute();
const onRoutes = computed(() => {
  return route.path;
});

const sidebar = useSidebarStore();
</script>

<style scoped>
.sidebar {
  display: block;
  position: absolute;
  left: 0;
  top: 70px;
  bottom: 0;
  overflow-y: scroll;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-right: 1px solid var(--border-primary);
  box-shadow: var(--shadow-light);
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--border-primary);
  border-radius: 3px;
  transition: all 0.3s ease;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

.sidebar-el-menu:not(.el-menu--collapse) {
  width: 250px;
}

.sidebar > ul {
  height: 100%;
  background: transparent !important;
}

/* Element Plus Menu Theme Overrides */
:deep(.el-menu) {
  background-color: transparent !important;
  border-right: none !important;
}

:deep(.el-menu-item) {
  background-color: transparent !important;
  border-radius: 8px !important;
  margin: 4px 8px !important;
  transition: all 0.3s ease !important;
  color: var(--text-secondary) !important;
}

:deep(.el-menu-item:hover) {
  background-color: var(--bg-hover) !important;
  color: var(--text-primary) !important;
  transform: translateX(4px) !important;
}

:deep(.el-menu-item.is-active) {
  background: var(--gradient-card) !important;
  color: var(--accent-primary) !important;
  border-left: 3px solid var(--accent-primary) !important;
  font-weight: 600 !important;
}

:deep(.el-sub-menu__title) {
  background-color: transparent !important;
  border-radius: 8px !important;
  margin: 4px 8px !important;
  transition: all 0.3s ease !important;
  color: var(--text-secondary) !important;
}

:deep(.el-sub-menu__title:hover) {
  background-color: var(--bg-hover) !important;
  color: var(--text-primary) !important;
  transform: translateX(4px) !important;
}

:deep(.el-sub-menu .el-menu) {
  background-color: var(--bg-tertiary) !important;
}

:deep(.el-sub-menu .el-menu-item) {
  background-color: transparent !important;
  padding-left: 40px !important;
}

:deep(.el-sub-menu .el-menu-item:hover) {
  background-color: var(--bg-hover) !important;
}

:deep(.el-icon) {
  color: var(--text-secondary) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-menu-item:hover .el-icon),
:deep(.el-sub-menu__title:hover .el-icon) {
  color: var(--text-primary) !important;
  transform: scale(1.1) !important;
}

:deep(.el-menu-item.is-active .el-icon) {
  color: var(--accent-primary) !important;
}
</style>
