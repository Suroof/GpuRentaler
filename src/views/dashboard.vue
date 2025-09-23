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
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">
            <h3>最近一周各品类销售图</h3>
          </div>
          <v-chart
            class="chart"
            :option="barChartOption"
            :theme="currentTheme"
            autoresize
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">
            <h3>最近几个月各品类销售趋势图</h3>
          </div>
          <v-chart
            class="chart"
            :option="lineChartOption"
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
import { BarChart, LineChart } from 'echarts/charts'
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

// 柱状图配置
const barChartOption = computed(() => ({
  backgroundColor: 'transparent',
  title: {
    show: false
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
      shadowStyle: {
        color: isDarkMode.value ? 'rgba(167, 139, 250, 0.1)' : 'rgba(196, 181, 253, 0.1)'
      }
    },
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
    data: ['家电', '百货', '食品', '服装'],
    top: '5%',
    textStyle: {
      color: isDarkMode.value ? '#cbd5e1' : '#475569'
    }
  },
  grid: {
    left: '8%',
    right: '8%',
    bottom: '10%',
    top: '20%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五'],
    axisTick: {
      show: false
    },
    axisLine: {
      lineStyle: {
        color: isDarkMode.value ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.5)'
      }
    },
    axisLabel: {
      color: isDarkMode.value ? '#94a3b8' : '#64748b'
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
      lineStyle: {
        color: isDarkMode.value ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.3)',
        type: 'dashed'
      }
    },
    axisLabel: {
      color: isDarkMode.value ? '#94a3b8' : '#64748b'
    }
  },
  series: [
    {
      name: '家电',
      type: 'bar',
      data: [234, 278, 270, 190, 230],
      itemStyle: {
        color: isDarkMode.value ? '#a5b4fc' : '#ddd6fe',
        borderRadius: [3, 3, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: isDarkMode.value ? '#c4b5fd' : '#e4d4fd'
        }
      },
      barWidth: '26%'
    },
    {
      name: '百货',
      type: 'bar',
      data: [164, 178, 190, 135, 160],
      itemStyle: {
        color: isDarkMode.value ? '#93c5fd' : '#bfdbfe',
        borderRadius: [3, 3, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: isDarkMode.value ? '#bae6fd' : '#dbeafe'
        }
      },
      barWidth: '26%'
    },
    {
      name: '食品',
      type: 'bar',
      data: [144, 198, 150, 235, 120],
      itemStyle: {
        color: isDarkMode.value ? '#fed7aa' : '#fed7aa',
        borderRadius: [3, 3, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: isDarkMode.value ? '#fde68a' : '#fef3c7'
        }
      },
      barWidth: '26%'
    },
    {
      name: '服装',
      type: 'bar',
      data: [120, 145, 180, 160, 200],
      itemStyle: {
        color: isDarkMode.value ? '#fca5a5' : '#fecaca',
        borderRadius: [3, 3, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: isDarkMode.value ? '#f87171' : '#fed7d7'
        }
      },
      barWidth: '26%'
    }
  ]
}))

// 折线图配置
const lineChartOption = computed(() => ({
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
    data: ['家电', '百货', '食品'],
    top: '5%',
    textStyle: {
      color: isDarkMode.value ? '#cbd5e1' : '#475569'
    }
  },
  grid: {
    left: '8%',
    right: '8%',
    bottom: '10%',
    top: '20%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: ['6月', '7月', '8月', '9月', '10月'],
    axisLine: {
      lineStyle: {
        color: isDarkMode.value ? 'rgba(148, 163, 184, 0.3)' : 'rgba(203, 213, 225, 0.5)'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: isDarkMode.value ? '#94a3b8' : '#64748b'
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
      lineStyle: {
        color: isDarkMode.value ? 'rgba(148, 163, 184, 0.1)' : 'rgba(203, 213, 225, 0.3)',
        type: 'dashed'
      }
    },
    axisLabel: {
      color: isDarkMode.value ? '#94a3b8' : '#64748b'
    }
  },
  series: [
    {
      name: '家电',
      type: 'line',
      smooth: true,
      data: [234, 278, 270, 190, 230],
      lineStyle: {
        width: 3,
        color: isDarkMode.value ? '#a78bfa' : '#c4b5fd'
      },
      itemStyle: {
        color: isDarkMode.value ? '#a78bfa' : '#c4b5fd',
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#1e1b4b' : '#ffffff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: isDarkMode.value ? 'rgba(167, 139, 250, 0.2)' : 'rgba(196, 181, 253, 0.15)' },
            { offset: 1, color: 'rgba(167, 139, 250, 0)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 5
    },
    {
      name: '百货',
      type: 'line',
      smooth: true,
      data: [164, 178, 150, 135, 160],
      lineStyle: {
        width: 3,
        color: isDarkMode.value ? '#60a5fa' : '#93c5fd'
      },
      itemStyle: {
        color: isDarkMode.value ? '#60a5fa' : '#93c5fd',
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#1e1b4b' : '#ffffff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: isDarkMode.value ? 'rgba(96, 165, 250, 0.2)' : 'rgba(147, 197, 253, 0.15)' },
            { offset: 1, color: 'rgba(96, 165, 250, 0)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 5
    },
    {
      name: '食品',
      type: 'line',
      smooth: true,
      data: [74, 118, 200, 235, 90],
      lineStyle: {
        width: 3,
        color: isDarkMode.value ? '#fb923c' : '#fed7aa'
      },
      itemStyle: {
        color: isDarkMode.value ? '#fb923c' : '#fed7aa',
        borderWidth: 2,
        borderColor: isDarkMode.value ? '#1e1b4b' : '#ffffff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: isDarkMode.value ? 'rgba(251, 146, 60, 0.2)' : 'rgba(254, 215, 170, 0.15)' },
            { offset: 1, color: 'rgba(251, 146, 60, 0)' }
          ]
        }
      },
      symbol: 'circle',
      symbolSize: 5
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
