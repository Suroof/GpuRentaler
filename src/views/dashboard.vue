<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card shadow="hover" class="mgb20" style="height: 252px">
          <div class="user-info">
            <el-avatar :size="120" :src="userinfo.avatar"/>
            <div class="user-info-cont">
              <div class="user-info-name">{{ userinfo.username }}</div>
              <div>hello world</div>
            </div>
          </div>
          <div class="user-info-list">
            上次登录时间：
            <span>2022-10-01</span>
          </div>
          <div class="user-info-list">
            上次登录地点：
            <span>东莞</span>
          </div>
        </el-card>
        <el-card shadow="hover" style="height: 252px">
          <template #header>
            <div class="clearfix">
              <span>语言详情</span>
            </div>
          </template>
          Vue
          <el-progress :percentage="79.4" color="#42b983"></el-progress>
          TypeScript
          <el-progress :percentage="14" color="#f1e05a"></el-progress>
          CSS
          <el-progress :percentage="5.6"></el-progress>
          HTML
          <el-progress :percentage="1" color="#f56c6c"></el-progress>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-row :gutter="20" class="mgb20">
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-1">
                <el-icon class="grid-con-icon">
                  <User/>
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">1234</div>
                  <div>用户访问量</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-2">
                <el-icon class="grid-con-icon">
                  <ChatDotRound/>
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">321</div>
                  <div>系统消息</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover" :body-style="{ padding: '0px' }">
              <div class="grid-content grid-con-3">
                <el-icon class="grid-con-icon">
                  <Goods/>
                </el-icon>
                <div class="grid-cont-right">
                  <div class="grid-num">5000</div>
                  <div>商品数量</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-card shadow="hover" style="height: 403px">
          <template #header>
            <div class="clearfix">
              <span>待办事项</span>
              <el-button style="float: right; padding: 3px 0" text>添加</el-button>
            </div>
          </template>

          <el-table :show-header="false" :data="todoList" style="width: 100%">
            <el-table-column width="40">
              <template #default="scope">
                <el-checkbox v-model="scope.row.status"></el-checkbox>
              </template>
            </el-table-column>
            <el-table-column>
              <template #default="scope">
                <div
                    class="todo-item"
                    :class="{
										'todo-item-del': scope.row.status
									}"
                >
                  {{ scope.row.title }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card shadow="hover">
          <schart ref="bar" class="schart" canvasId="bar" :options="options"></schart>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <schart ref="line" class="schart" canvasId="line" :options="options2"></schart>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="dashboard">
import Schart from 'vue-schart';
import {reactive} from 'vue';
import {useBasicStore} from "../store/basic";

let basicStore = useBasicStore();
let userinfo = basicStore.userinfo;

const options = {
  type: 'bar',
  title: {
    text: '最近一周各品类销售图'
  },
  xRorate: 25,
  labels: ['周一', '周二', '周三', '周四', '周五'],
  datasets: [
    {
      label: '家电',
      data: [234, 278, 270, 190, 230]
    },
    {
      label: '百货',
      data: [164, 178, 190, 135, 160]
    },
    {
      label: '食品',
      data: [144, 198, 150, 235, 120]
    }
  ]
};
const options2 = {
  type: 'line',
  title: {
    text: '最近几个月各品类销售趋势图'
  },
  labels: ['6月', '7月', '8月', '9月', '10月'],
  datasets: [
    {
      label: '家电',
      data: [234, 278, 270, 190, 230]
    },
    {
      label: '百货',
      data: [164, 178, 150, 135, 160]
    },
    {
      label: '食品',
      data: [74, 118, 200, 235, 90]
    }
  ]
};
const todoList = reactive([
  {
    title: '今天要修复100个bug',
    status: false
  },
  {
    title: '今天要修复100个bug',
    status: false
  },
  {
    title: '今天要写100行代码加几个bug吧',
    status: false
  },
  {
    title: '今天要修复100个bug',
    status: false
  },
  {
    title: '今天要修复100个bug',
    status: true
  },
  {
    title: '今天要写100行代码加几个bug吧',
    status: true
  }
]);
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

.grid-content {
  display: flex;
  align-items: center;
  height: 100px;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 0 20px;
  transition: all 0.3s ease;
  border: 1px solid var(--border-primary);
}

.grid-content:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-heavy);
}

.grid-cont-right {
  flex: 1;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

.grid-num {
  font-size: 30px;
  font-weight: bold;
  color: var(--text-primary);
}

.grid-con-icon {
  font-size: 50px;
  width: 70px;
  height: 70px;
  text-align: center;
  line-height: 70px;
  color: #fff;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.grid-content:hover .grid-con-icon {
  transform: scale(1.1);
}

.grid-con-1 .grid-con-icon {
  background: linear-gradient(135deg, #2d8cf0, #1976d2);
  box-shadow: 0 8px 25px rgba(45, 140, 240, 0.4);
}

.grid-con-1 .grid-num {
  color: #2d8cf0;
}

.grid-con-2 .grid-con-icon {
  background: linear-gradient(135deg, #64d572, #4caf50);
  box-shadow: 0 8px 25px rgba(100, 213, 114, 0.4);
}

.grid-con-2 .grid-num {
  color: #64d572;
}

.grid-con-3 .grid-con-icon {
  background: linear-gradient(135deg, #f25e43, #e91e63);
  box-shadow: 0 8px 25px rgba(242, 94, 67, 0.4);
}

.grid-con-3 .grid-num {
  color: #f25e43;
}

.user-info {
  display: flex;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 2px solid var(--border-primary);
  margin-bottom: 20px;
}

.user-info-cont {
  padding-left: 50px;
  flex: 1;
  font-size: 14px;
  color: var(--text-secondary);
}

.user-info-cont div:first-child {
  font-size: 30px;
  color: var(--text-primary);
  font-weight: 600;
}

.user-info-list {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 25px;
}

.user-info-list span {
  margin-left: 70px;
  color: var(--text-primary);
  font-weight: 500;
}

.mgb20 {
  margin-bottom: 20px;
}

.todo-item {
  font-size: 14px;
  color: var(--text-primary);
}

.todo-item-del {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

.schart {
  width: 100%;
  height: 300px;
  background: var(--bg-card);
  border-radius: 12px;
  padding: 20px;
}

/* Element Plus Components Theme Overrides for Dashboard */
:deep(.el-card) {
  background: var(--bg-card) !important;
  backdrop-filter: blur(20px) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: 16px !important;
  box-shadow: var(--shadow-medium) !important;
  transition: all 0.3s ease !important;
}

:deep(.el-card:hover) {
  transform: translateY(-4px) !important;
  box-shadow: var(--shadow-heavy) !important;
}

:deep(.el-card__header) {
  background: var(--bg-tertiary) !important;
  border-bottom: 1px solid var(--border-primary) !important;
  color: var(--text-primary) !important;
  font-weight: 600 !important;
}

:deep(.el-card__body) {
  color: var(--text-primary) !important;
}

:deep(.el-progress__text) {
  color: var(--text-primary) !important;
}

:deep(.el-checkbox__label) {
  color: var(--text-primary) !important;
}

:deep(.el-table) {
  background: transparent !important;
}

:deep(.el-table__body tr) {
  background: transparent !important;
}

:deep(.el-table__body tr:hover) {
  background: var(--bg-hover) !important;
}

:deep(.el-table td) {
  border-bottom: 1px solid var(--border-secondary) !important;
}

:deep(.el-button--text) {
  color: var(--accent-primary) !important;
}

:deep(.el-button--text:hover) {
  color: var(--accent-primary) !important;
  background: var(--bg-hover) !important;
}
</style>
