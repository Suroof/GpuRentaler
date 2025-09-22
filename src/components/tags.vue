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

<style>
.tags {
	position: relative;
	height: 30px;
	overflow: hidden;
	background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
	padding-right: 120px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tags ul {
	box-sizing: border-box;
	width: 100%;
	height: 100%;
}

.tags-li {
	display: flex;
	align-items: center;
	float: left;
	margin: 3px 5px 2px 3px;
	border-radius: 6px;
	font-size: 12px;
	overflow: hidden;
	cursor: pointer;
	height: 23px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(40, 40, 40, 0.8);
	backdrop-filter: blur(10px);
	padding: 0 5px 0 12px;
	color: #cccccc;
	-webkit-transition: all 0.3s ease-in;
	-moz-transition: all 0.3s ease-in;
	transition: all 0.3s ease-in;
}

.tags-li:not(.active):hover {
	background: rgba(60, 60, 60, 0.9);
	border-color: rgba(255, 255, 255, 0.4);
	color: #ffffff;
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.tags-li.active {
	color: #fff;
	background: linear-gradient(135deg, #333333 0%, #555555 50%, #333333 100%);
	border-color: rgba(255, 255, 255, 0.6);
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.tags-li-title {
	float: left;
	max-width: 80px;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
	margin-right: 5px;
	color: #cccccc;
	transition: all 0.3s ease;
}

.tags-li.active .tags-li-title {
	color: #fff;
	font-weight: 500;
}

.tags-li:hover .tags-li-title {
	color: #ffffff;
}

.tags-close-box {
	position: absolute;
	right: 0;
	top: 0;
	box-sizing: border-box;
	padding-top: 1px;
	text-align: center;
	width: 110px;
	height: 30px;
	background: linear-gradient(90deg, transparent, rgba(26, 26, 26, 0.95));
	backdrop-filter: blur(10px);
	box-shadow: -3px 0 15px 3px rgba(0, 0, 0, 0.3);
	z-index: 10;
}

.tags-close-box :deep(.el-button) {
	background: rgba(40, 40, 40, 0.8) !important;
	border-color: rgba(255, 255, 255, 0.2) !important;
	color: #ffffff !important;
	font-size: 11px !important;
	height: 24px !important;
	padding: 0 8px !important;
	border-radius: 6px !important;
	transition: all 0.3s ease !important;
}

.tags-close-box :deep(.el-button:hover) {
	background: rgba(60, 60, 60, 0.9) !important;
	border-color: rgba(255, 255, 255, 0.4) !important;
	transform: translateY(-1px) !important;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.tags-close-box :deep(.el-dropdown-menu) {
	background: rgba(20, 20, 20, 0.95) !important;
	border: 1px solid rgba(255, 255, 255, 0.1) !important;
	backdrop-filter: blur(20px) !important;
}

.tags-close-box :deep(.el-dropdown-menu__item) {
	color: #ffffff !important;
	border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.tags-close-box :deep(.el-dropdown-menu__item:hover) {
	background: rgba(40, 40, 40, 0.8) !important;
	color: #ffffff !important;
}

.tags-li :deep(.el-icon) {
	color: #cccccc;
	margin-left: 4px;
	transition: all 0.3s ease;
	font-size: 12px;
}

.tags-li:hover :deep(.el-icon) {
	color: #ffffff;
	transform: scale(1.1);
}

.tags-li.active :deep(.el-icon) {
	color: #ffffff;
}
</style>
