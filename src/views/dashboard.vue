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
            <div class="info-item">
              <span class="info-label">上次登录时间：</span>
              <span class="info-value">2022-10-01</span>
            </div>
          </div>
          <div class="user-info-list">
            <div class="info-item">
              <span class="info-label">上次登录地点：</span>
              <span class="info-value">东莞</span>
            </div>
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
        <el-row :gutter="24" class="mgb20">
          <el-col :span="8">
            <div class="stats-card stats-card-1">
              <div class="stats-icon">
                <el-icon>
                  <User/>
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-label">用户访问量</div>
                <div class="stats-number">1,234</div>
                <div class="stats-trend">
                  <span class="trend-up">↗ +12%</span>
                </div>
              </div>
              <div class="stats-bg-pattern"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stats-card stats-card-2">
              <div class="stats-icon">
                <el-icon>
                  <ChatDotRound/>
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-label">系统消息</div>
                <div class="stats-number">321</div>
                <div class="stats-trend">
                  <span class="trend-up">↗ +8%</span>
                </div>
              </div>
              <div class="stats-bg-pattern"></div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="stats-card stats-card-3">
              <div class="stats-icon">
                <el-icon>
                  <Goods/>
                </el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-label">商品数量</div>
                <div class="stats-number">5,000</div>
                <div class="stats-trend">
                  <span class="trend-down">↘ -3%</span>
                </div>
              </div>
              <div class="stats-bg-pattern"></div>
            </div>
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
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">
            <h3>趋势分析图</h3>
          </div>
          <v-chart
            class="chart"
            :option="areaChartOption"
            :theme="currentTheme"
            autoresize
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">
            <h3>加载速度</h3>
          </div>
          <v-chart
            class="chart"
            :option="donutChartOption"
            :theme="currentTheme"
            autoresize
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts" name="dashboard">
import { reactive, computed, onMounted, ref } from 'vue'
import { use } from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart, { THEME_KEY } from 'vue-echarts'
import { provide } from 'vue'
import { useBasicStore } from "../store/basic"

// 注册ECharts组件
use([
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  BarChart,
  LineChart,
  PieChart,
  CanvasRenderer
])

const basicStore = useBasicStore()
const userinfo = basicStore.userinfo

// 主题检测
const isDarkMode = ref(false)

const checkTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark') ||
                    document.documentElement.getAttribute('data-theme') === 'dark' ||
                    window.matchMedia('(prefers-color-scheme: dark)').matches
}

onMounted(() => {
  checkTheme()
  // 监听主题变化
  const observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme']
  })

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkTheme)
})

// 当前主题
const currentTheme = computed(() => isDarkMode.value ? 'dark' : 'light')

// 提供主题给ECharts
provide(THEME_KEY, currentTheme)

// 面积图配置 (左侧图表)
const areaChartOption = computed(() => ({
  backgroundColor: 'transparent',
  title: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: isDarkMode.value ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDarkMode.value ? 'rgba(167, 139, 250, 0.2)' : 'rgba(196, 181, 253, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    textStyle: {
      color: isDarkMode.value ? '#e2e8f0' : '#334155',
      fontSize: 12
    },
    extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px);'
  },
  legend: {
    data: ['Debit', 'Credit'],
    bottom: '10%',
    left: 'center',
    itemGap: 20,
    textStyle: {
      color: isDarkMode.value ? '#cbd5e1' : '#64748b',
      fontSize: 12
    },
    itemWidth: 12,
    itemHeight: 12
  },
  grid: {
    left: '5%',
    right: '5%',
    bottom: '20%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    boundaryGap: false,
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    axisLabel: {
      color: isDarkMode.value ? '#94a3b8' : '#94a3b8',
      fontSize: 11
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    splitLine: {
      show: false
    },
    axisLabel: {
      color: isDarkMode.value ? '#94a3b8' : '#94a3b8',
      fontSize: 11
    }
  },
  series: [
    {
      name: 'Debit',
      type: 'line',
      data: [20, 35, 25, 60, 45, 75, 85],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 0
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: isDarkMode.value ? 'rgba(59, 130, 246, 0.6)' : 'rgba(59, 130, 246, 0.6)' },
            { offset: 0.5, color: isDarkMode.value ? 'rgba(59, 130, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)' },
            { offset: 1, color: isDarkMode.value ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)' }
          ]
        }
      },
      stack: 'total'
    },
    {
      name: 'Credit',
      type: 'line',
      data: [30, 25, 40, 35, 55, 45, 65],
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 0
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: isDarkMode.value ? 'rgba(139, 92, 246, 0.7)' : 'rgba(139, 92, 246, 0.7)' },
            { offset: 0.5, color: isDarkMode.value ? 'rgba(139, 92, 246, 0.5)' : 'rgba(139, 92, 246, 0.5)' },
            { offset: 1, color: isDarkMode.value ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)' }
          ]
        }
      },
      stack: 'total'
    }
  ]
}))

// 环形图配置 (右侧图表)
const donutChartOption = computed(() => ({
  backgroundColor: 'transparent',
  title: {
    show: false
  },
  tooltip: {
    trigger: 'item',
    backgroundColor: isDarkMode.value ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    borderColor: isDarkMode.value ? 'rgba(167, 139, 250, 0.2)' : 'rgba(196, 181, 253, 0.3)',
    borderWidth: 1,
    borderRadius: 8,
    textStyle: {
      color: isDarkMode.value ? '#e2e8f0' : '#334155',
      fontSize: 12
    },
    extraCssText: 'box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); backdrop-filter: blur(10px);',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: '60%',
    top: '5%',
    itemGap: 15,
    textStyle: {
      color: isDarkMode.value ? '#cbd5e1' : '#64748b',
      fontSize: 12
    },
    formatter: function(name: string) {
      const data: { [key: string]: string } = {
        'Vuestic 2.0': '(3 ms)',
        'Vuestic 1.0': '(14 ms)',
        'Random Vue.js Theme': '(40 ms)'
      };
      return name + ' ' + (data[name] || '');
    }
  },
  series: [
    {
      name: 'Loading Speed',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          borderWidth: 8,
          borderColor: isDarkMode.value ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)'
        },
        scale: true,
        scaleSize: 15,
        label: {
          show: false
        }
      },
      labelLine: {
        show: false
      },
      data: [
        {
          value: 60,
          name: 'Vuestic 2.0',
          itemStyle: {
            color: isDarkMode.value ? '#60a5fa' : '#7dd3fc'
          }
        },
        {
          value: 25,
          name: 'Vuestic 1.0',
          itemStyle: {
            color: isDarkMode.value ? '#3b82f6' : '#3b82f6'
          }
        },
        {
          value: 15,
          name: 'Random Vue.js Theme',
          itemStyle: {
            color: isDarkMode.value ? '#10b981' : '#34d399'
          }
        }
      ]
    }
  ]
}))

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
])
</script>

<style scoped>
.el-row {
  margin-bottom: 20px;
}

/* 统计卡片样式 */
.stats-card {
  position: relative;
  display: flex;
  align-items: center;
  height: 120px;
  background: var(--gradient-card);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--border-primary);
  border-bottom: 2px solid var(--border-primary);
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stats-card:hover {
  transform: translateY(-8px);
  border-bottom: 10px solid rgba(226, 226, 226, 0.8);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.15),
    0 8px 16px rgba(0, 0, 0, 0.1);
}

.stats-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  transition: all 0.3s ease;
}

.stats-icon .el-icon {
  font-size: 32px;
  color: #ffffff;
}

.stats-content {
  flex: 1;
  z-index: 2;
}

.stats-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.stats-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 4px;
  background: linear-gradient(135deg, var(--text-primary), var(--accent-primary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-trend {
  font-size: 12px;
  font-weight: 600;
}

.trend-up {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.trend-down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.stats-bg-pattern {
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  opacity: 0.1;
  transition: all 0.3s ease;
}

.stats-card:hover .stats-bg-pattern {
  transform: scale(1.1) rotate(10deg);
  opacity: 0.15;
}

.stats-card:hover .stats-icon {
  transform: scale(1.1) rotate(-5deg);
}

/* 卡片特定样式 */
.stats-card-1 .stats-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
}

.stats-card-1 .stats-bg-pattern {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.stats-card-2 .stats-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  box-shadow: 0 8px 32px rgba(240, 147, 251, 0.4);
}

.stats-card-2 .stats-bg-pattern {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.stats-card-3 .stats-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  box-shadow: 0 8px 32px rgba(79, 172, 254, 0.4);
}

.stats-card-3 .stats-bg-pattern {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
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
  margin-bottom: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  white-space: nowrap;
  gap: 16px;
}

.info-label {
  color: var(--text-secondary);
  font-weight: 500;
  flex-shrink: 0;
  min-width: 120px;
}

.info-value {
  color: var(--text-primary);
  font-weight: 600;
  text-align: right;
  flex-grow: 1;
}

.mgb20 {
    margin-bottom: 20px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-content: center;
    justify-content: center;
    align-items: center;
}

.todo-item {
  font-size: 14px;
  color: var(--text-primary);
}

.todo-item-del {
  text-decoration: line-through;
  color: var(--text-tertiary);
}

/* 图表卡片样式 */
.chart-card {
  height: 400px;
  overflow: hidden;
}

.chart-header {
  padding: 0 0 16px 0;
  border-bottom: 1px solid var(--border-secondary);
  margin-bottom: 16px;
}

.chart-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-header h3::before {
  content: '';
  width: 3px;
  height: 14px;
  background: #e5e7eb;
  border-radius: 1px;
  display: inline-block;
}

.chart {
  width: 100%;
  height: 320px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .chart-card {
    height: 380px;
  }

  .chart {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .chart-card {
    height: 350px;
  }

  .chart {
    height: 270px;
  }

  .chart-header h3 {
    font-size: 14px;
  }
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

/* 图表容器深度样式优化 */
.chart :deep(canvas) {
  border-radius: 8px;
}

/* 图表容器扁平化处理 */
.chart-card .chart {
  transition: none;
}

/* 深色模式下的图表头部优化 */
@media (prefers-color-scheme: dark) {
  .chart-header h3::before {
    background: #4f46e5;
  }
}

:root.dark .chart-header h3::before,
[data-theme="dark"] .chart-header h3::before {
  background: #6366f1;
}
</style>
