<template>
  <div class="header">
    <!-- 折叠按钮 -->
    <div class="collapse-btn" @click="collapseChage">
      <el-icon v-if="sidebar.collapse">
        <Expand/>
      </el-icon>
      <el-icon v-else>
        <Fold/>
      </el-icon>
    </div>
    <div class="logo">Admin3后台管理系统</div>
    <div class="header-right">
      <div class="header-user-con">
        <!-- 主题切换按钮 -->
        <div class="theme-toggle" @click="toggleTheme">
          <el-tooltip
            effect="dark"
            :content="themeStore.isDark ? '切换到明亮主题' : '切换到暗黑主题'"
            placement="bottom"
          >
            <el-icon v-if="themeStore.isDark">
              <Sunny />
            </el-icon>
            <el-icon v-else>
              <Moon />
            </el-icon>
          </el-tooltip>
        </div>
        <!-- 消息中心 -->
        <div class="btn-bell" @click="router.push('/tabs')">
          <el-tooltip
              effect="dark"
              :content="message ? `有${message}条未读消息` : `消息中心`"
              placement="bottom"
          >
            <i class="el-icon-lx-notice"></i>
          </el-tooltip>
          <span class="btn-bell-badge" v-if="message"></span>
        </div>
        <!-- 用户头像 -->
        <el-avatar class="user-avator" :size="30" :src="avatar"/>
        <!-- 用户名下拉菜单 -->
        <el-dropdown class="user-name" trigger="click" @command="handleCommand">
					<span class="el-dropdown-link">
						{{ username }}
						<el-icon class="el-icon--right">
							<arrow-down/>
						</el-icon>
					</span>
          <template #dropdown>
            <el-dropdown-menu>
<!--              <a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                <el-dropdown-item>项目仓库</el-dropdown-item>
              </a>-->
              <el-dropdown-item command="user">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted} from 'vue';
import {useSidebarStore} from '../store/sidebar';
import {useThemeStore} from '../store/theme';
import {useRouter} from 'vue-router';
import {logout} from "../api/login";
import {useBasicStore} from "../store/basic";

const userinfoStore = useBasicStore();
const userinfo = userinfoStore.userinfo;
const username: string | null = userinfo.username;
const avatar: string | null = userinfo.avatar;
const message: number = 2;

const sidebar = useSidebarStore();
const themeStore = useThemeStore();

// 侧边栏折叠
const collapseChage = () => {
  sidebar.handleCollapse();
};

// 主题切换
const toggleTheme = () => {
  themeStore.toggleTheme();
};

onMounted(() => {
  if (document.body.clientWidth < 1500) {
    collapseChage();
  }
});

// 用户名下拉菜单选择事件
const router = useRouter();
const handleCommand = (command: string) => {
  if (command == 'loginout') {
    logout().then(() => {
      localStorage.removeItem('token');
      router.push('/login');
    })
  } else if (command == 'user') {
    router.push('/user');
  }
};
</script>
<style scoped>
.header {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 70px;
  font-size: 22px;
  color: var(--text-primary);
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-primary);
  box-shadow: var(--shadow-light);
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  float: left;
  padding: 0 21px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 10px;
}

.collapse-btn:hover {
  background: var(--bg-hover);
  transform: scale(1.05);
}

.header .logo {
  float: left;
  width: 250px;
  line-height: 70px;
  font-weight: 700;
  color: var(--text-primary);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right {
  float: right;
  padding-right: 50px;
}

.header-user-con {
  display: flex;
  height: 70px;
  align-items: center;
  gap: 15px;
}

.theme-toggle,
.btn-bell,
.btn-fullscreen {
  position: relative;
  width: 40px;
  height: 40px;
  text-align: center;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  color: var(--text-primary);
}

.theme-toggle:hover,
.btn-bell:hover,
.btn-fullscreen:hover {
  background: var(--bg-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-light);
  border-color: var(--border-hover);
}

.theme-toggle {
  font-size: 18px;
}

.theme-toggle:hover {
  color: var(--accent-warning);
}

.btn-bell-badge {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(135deg, #ff4757, #ff3838);
  border: 2px solid var(--bg-primary);
}

.btn-bell .el-icon-lx-notice {
  color: var(--text-primary);
  font-size: 18px;
}

.user-name {
  margin-left: 10px;
}

.user-avator {
  margin-left: 20px;
  border: 2px solid var(--border-primary);
  transition: all 0.3s ease;
}

.user-avator:hover {
  border-color: var(--border-hover);
  transform: scale(1.05);
}

.el-dropdown-link {
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 8px;
  background: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
  transition: all 0.3s ease;
  font-weight: 500;
}

.el-dropdown-link:hover {
  background: var(--bg-hover);
  transform: translateY(-1px);
  border-color: var(--border-hover);
}

.el-dropdown-menu__item {
  text-align: center;
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--border-secondary) !important;
}

.el-dropdown-menu__item:hover {
  background: var(--bg-hover) !important;
  color: var(--text-primary) !important;
}
</style>
