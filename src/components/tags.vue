<template>
	<div class="tags" v-if="tags.show">
		<ul>
			<li
				class="tags-li"
				v-for="(item, index) in tags.list"
				:class="{ active: isActive(item.path) }"
				:key="index"
			>
				<router-link :to="item.path" class="tags-li-title">{{ item.title }}</router-link>
				<el-icon @click="closeTags(index)"><Close /></el-icon>
			</li>
		</ul>
		<div class="tags-close-box">
			<el-dropdown @command="handleTags">
				<el-button size="small" type="primary">
					标签选项
					<el-icon class="el-icon--right">
						<arrow-down />
					</el-icon>
				</el-button>
				<template #dropdown>
					<el-dropdown-menu size="small">
						<el-dropdown-item command="other">关闭其他</el-dropdown-item>
						<el-dropdown-item command="all">关闭所有</el-dropdown-item>
					</el-dropdown-menu>
				</template>
			</el-dropdown>
		</div>
	</div>
</template>

<script setup lang="ts">
import {useTagsStore} from '../store/tags';
import {onBeforeRouteUpdate, useRoute, useRouter} from 'vue-router';

const route = useRoute();
const router = useRouter();
const isActive = (path: string) => {
	return path === route.fullPath;
};

const tags = useTagsStore();
// 关闭单个标签
const closeTags = (index: number) => {
	const delItem = tags.list[index];
	tags.delTagsItem(index);
	const item = tags.list[index] ? tags.list[index] : tags.list[index - 1];
	if (item) {
		delItem.path === route.fullPath && router.push(item.path);
	} else {
		router.push('/');
	}
};

// 设置标签
const setTags = (route: any) => {
	const isExist = tags.list.some(item => {
		return item.path === route.fullPath;
	});
	if (!isExist) {
		if (tags.list.length >= 8) tags.delTagsItem(0);
		tags.setTagsItem({
			name: route.name,
			title: route.meta.title,
			path: route.fullPath
		});
	}
};
setTags(route);
onBeforeRouteUpdate(to => {
	setTags(to);
});

// 关闭全部标签
const closeAll = () => {
	tags.clearTags();
	router.push('/');
};
// 关闭其他标签
const closeOther = () => {
	const curItem = tags.list.filter(item => {
		return item.path === route.fullPath;
	});
	tags.closeTagsOther(curItem);
};
const handleTags = (command: string) => {
	command === 'other' ? closeOther() : closeAll();
};

// 关闭当前页面的标签页
// tags.closeCurrentTag({
//     $router: router,
//     $route: route
// });
</script>

<style scoped>
.tags {
	position: relative;
	height: 40px;
	overflow: hidden;
	background: var(--bg-primary, #ffffff);
	border-bottom: 1px solid var(--border-light, rgba(0, 0, 0, 0.06));
	padding: 8px 120px 8px 16px;
	backdrop-filter: blur(8px);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
	.tags {
		background: var(--bg-primary-dark, #0f172a);
		border-bottom-color: var(--border-light-dark, rgba(255, 255, 255, 0.08));
	}
}

.tags ul {
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	gap: 2px;
	overflow-x: auto;
	overflow-y: hidden;
	scrollbar-width: none;
	-ms-overflow-style: none;
}

.tags ul::-webkit-scrollbar {
	display: none;
}

.tags-li {
	position: relative;
	display: flex;
	align-items: center;
	flex-shrink: 0;
	border-radius: 8px;
	font-size: 13px;
	font-weight: 500;
	cursor: pointer;
	height: 28px;
	border: none;
	background: transparent;
	padding: 0 6px 0 12px;
	color: var(--text-secondary, #64748b);
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
	margin-right: 2px;
}

.tags-li::before {
	content: '';
	position: absolute;
	left: 0;
	top: 0;
	right: 0;
	bottom: 0;
	background: transparent;
	border-radius: 8px;
	transition: all 0.2s ease;
	z-index: -1;
}

.tags-li:hover::before {
	background: var(--bg-hover, rgba(148, 163, 184, 0.1));
}

.tags-li:hover {
	color: var(--text-primary, #1e293b);
}

.tags-li.active {
	color: var(--accent-primary, #0ea5e9);
	font-weight: 600;
}

.tags-li.active::before {
	background: var(--accent-bg, rgba(14, 165, 233, 0.1));
}

.tags-li.active::after {
	content: '';
	position: absolute;
	bottom: -8px;
	left: 50%;
	transform: translateX(-50%);
	width: 24px;
	height: 2px;
	background: var(--accent-primary, #0ea5e9);
	border-radius: 1px;
}

/* 深色模式标签 */
@media (prefers-color-scheme: dark) {
	.tags-li {
		color: var(--text-secondary-dark, #94a3b8);
	}

	.tags-li:hover::before {
		background: var(--bg-hover-dark, rgba(148, 163, 184, 0.08));
	}

	.tags-li:hover {
		color: var(--text-primary-dark, #f1f5f9);
	}

	.tags-li.active {
		color: var(--accent-primary-dark, #38bdf8);
	}

	.tags-li.active::before {
		background: var(--accent-bg-dark, rgba(56, 189, 248, 0.1));
	}

	.tags-li.active::after {
		background: var(--accent-primary-dark, #38bdf8);
	}
}

.tags-li-title {
	max-width: 120px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	margin-right: 4px;
	text-decoration: none;
	color: inherit;
}

.tags-close-box {
	position: absolute;
	right: 0;
	top: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 16px;
	width: 120px;
	background: linear-gradient(90deg,
		transparent 0%,
		var(--bg-primary, #ffffff) 40%,
		var(--bg-primary, #ffffff) 100%);
	z-index: 10;
}

/* 深色模式关闭区域 */
@media (prefers-color-scheme: dark) {
	.tags-close-box {
		background: linear-gradient(90deg,
			transparent 0%,
			var(--bg-primary-dark, #0f172a) 40%,
			var(--bg-primary-dark, #0f172a) 100%);
	}
}

.tags-close-box :deep(.el-button) {
	background: var(--bg-secondary, #f8fafc) !important;
	border: none !important;
	color: var(--text-secondary, #64748b) !important;
	font-size: 12px !important;
	font-weight: 500 !important;
	height: 28px !important;
	padding: 0 12px !important;
	border-radius: 8px !important;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
	box-shadow: none !important;
}

.tags-close-box :deep(.el-button:hover) {
	background: var(--bg-hover, rgba(148, 163, 184, 0.1)) !important;
	color: var(--text-primary, #1e293b) !important;
	transform: translateY(-1px) !important;
}

/* 深色模式按钮 */
@media (prefers-color-scheme: dark) {
	.tags-close-box :deep(.el-button) {
		background: var(--bg-secondary-dark, #1e293b) !important;
		color: var(--text-secondary-dark, #94a3b8) !important;
	}

	.tags-close-box :deep(.el-button:hover) {
		background: var(--bg-hover-dark, rgba(148, 163, 184, 0.08)) !important;
		color: var(--text-primary-dark, #f1f5f9) !important;
	}
}

.tags-close-box :deep(.el-dropdown-menu) {
	background: var(--bg-card, #ffffff) !important;
	border: 1px solid var(--border-light, rgba(0, 0, 0, 0.06)) !important;
	border-radius: 12px !important;
	padding: 8px !important;
	box-shadow:
		0 4px 6px -1px rgba(0, 0, 0, 0.1),
		0 2px 4px -2px rgba(0, 0, 0, 0.1) !important;
	backdrop-filter: blur(12px) !important;
}

.tags-close-box :deep(.el-dropdown-menu__item) {
	color: var(--text-primary, #1e293b) !important;
	padding: 8px 12px !important;
	border-radius: 8px !important;
	font-weight: 500 !important;
	transition: all 0.2s ease !important;
	border-bottom: none !important;
	margin: 2px 0 !important;
}

.tags-close-box :deep(.el-dropdown-menu__item:hover) {
	background: var(--bg-hover, rgba(148, 163, 184, 0.1)) !important;
	color: var(--text-primary, #1e293b) !important;
}

/* 深色模式下拉菜单 */
@media (prefers-color-scheme: dark) {
	.tags-close-box :deep(.el-dropdown-menu) {
		background: var(--bg-card-dark, #1e293b) !important;
		border-color: var(--border-light-dark, rgba(255, 255, 255, 0.08)) !important;
	}

	.tags-close-box :deep(.el-dropdown-menu__item) {
		color: var(--text-primary-dark, #f1f5f9) !important;
	}

	.tags-close-box :deep(.el-dropdown-menu__item:hover) {
		background: var(--bg-hover-dark, rgba(148, 163, 184, 0.08)) !important;
		color: var(--text-primary-dark, #f1f5f9) !important;
	}
}

.tags-li :deep(.el-icon) {
	color: var(--text-tertiary, #94a3b8);
	margin-left: 2px;
	padding: 2px;
	border-radius: 4px;
	transition: all 0.2s ease;
	font-size: 14px;
	cursor: pointer;
}

.tags-li :deep(.el-icon):hover {
	color: var(--danger-primary, #ef4444);
	background: var(--danger-bg, rgba(239, 68, 68, 0.1));
}

.tags-li.active :deep(.el-icon) {
	color: var(--accent-secondary, rgba(14, 165, 233, 0.7));
}

.tags-li.active :deep(.el-icon):hover {
	color: var(--danger-primary, #ef4444);
	background: var(--danger-bg, rgba(239, 68, 68, 0.1));
}

/* 深色模式图标 */
@media (prefers-color-scheme: dark) {
	.tags-li :deep(.el-icon) {
		color: var(--text-tertiary-dark, #64748b);
	}

	.tags-li.active :deep(.el-icon) {
		color: var(--accent-secondary-dark, rgba(56, 189, 248, 0.7));
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.tags {
		height: 36px;
		padding: 6px 100px 6px 12px;
	}

	.tags-close-box {
		width: 100px;
		padding: 0 12px;
	}

	.tags-li {
		font-size: 12px;
		height: 26px;
		padding: 0 4px 0 10px;
	}

	.tags-li-title {
		max-width: 80px;
	}
}

/* CSS变量定义 */
:root {
	--bg-primary: #ffffff;
	--bg-secondary: #f8fafc;
	--bg-card: #ffffff;
	--bg-hover: rgba(148, 163, 184, 0.1);
	--border-light: rgba(0, 0, 0, 0.06);
	--text-primary: #1e293b;
	--text-secondary: #64748b;
	--text-tertiary: #94a3b8;
	--accent-primary: #0ea5e9;
	--accent-secondary: rgba(14, 165, 233, 0.7);
	--accent-bg: rgba(14, 165, 233, 0.1);
	--danger-primary: #ef4444;
	--danger-bg: rgba(239, 68, 68, 0.1);
}

@media (prefers-color-scheme: dark) {
	:root {
		--bg-primary-dark: #0f172a;
		--bg-secondary-dark: #1e293b;
		--bg-card-dark: #1e293b;
		--bg-hover-dark: rgba(148, 163, 184, 0.08);
		--border-light-dark: rgba(255, 255, 255, 0.08);
		--text-primary-dark: #f1f5f9;
		--text-secondary-dark: #94a3b8;
		--text-tertiary-dark: #64748b;
		--accent-primary-dark: #38bdf8;
		--accent-secondary-dark: rgba(56, 189, 248, 0.7);
		--accent-bg-dark: rgba(56, 189, 248, 0.1);
	}
}
</style>
