<template>
  <div class="task-container">
    <el-tabs
      v-model="activeTab"
      class="task-tabs"
      @tab-change="handleTabChange"
    >
      <el-tab-pane label="我的任务" name="myTasks">
        <el-card class="task-card">
          <template #header>
            <div class="card-header">
              <span>我的任务列表</span>
              <div class="header-actions">
                <el-select
                  v-model="taskFilters.status"
                  placeholder="任务状态"
                  style="width: 120px; margin-right: 10px"
                  clearable
                  @change="fetchMyTaskList"
                >
                  <el-option label="运行中" value="active" />
                  <el-option label="已完成" value="completed" />
                </el-select>
                <el-button type="primary" @click="fetchMyTaskList"
                  >刷新</el-button
                >
              </div>
            </div>
          </template>

          <el-table
            :data="myTasks"
            :loading="tasksLoading"
            :border="true"
            style="width: 100%"
          >
            <el-table-column prop="id" label="任务ID" width="100" />
            <el-table-column prop="gpuDeviceId" label="GPU设备ID" width="150">
              <template #default="{ row }">
                {{ row.deviceId }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getTaskStatusType(row.status)">
                  {{ getTaskStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="开始时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.startTime) }}
              </template>
            </el-table-column>
            <el-table-column prop="endTime" label="结束时间" width="180">
              <template #default="{ row }">
                {{ formatDateTime(row.endTime) }}
              </template>
            </el-table-column>
            <el-table-column
              prop="actualDurationHours"
              label="持续时间(小时)"
              width="120"
            >
              <template #default="{ row }">
                {{ row.actualDurationHours }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="338" fixed="right">
              <template #default="{ row }">
                <el-button size="small" @click="viewTaskLog(row)"
                  >查看日志</el-button
                >
                <el-button size="small" @click="showExportDialog(row)"
                  >导出数据</el-button
                >
                <el-button size="small" @click="showFinishTaskDialog(row)"
                  >完成任务</el-button
                >
                <el-button
                  v-if="row.status === 'RUNNING'"
                  size="small"
                  type="danger"
                  @click="finishTaskHandler(row)"
                >
                  结束任务
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="taskPagination.currentPage"
              v-model:page-size="taskPagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="taskPagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleTaskSizeChange"
              @current-change="handleTaskCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 任务日志对话框 -->
    <el-dialog
      v-model="logDialogVisible"
      title="任务日志"
      width="60%"
      :before-close="handleLogDialogClose"
    >
      <div class="log-header">
        <el-input-number
          v-model="logNum"
          :min="1"
          :max="100"
          :step="1"
          style="width: 120px; margin-right: 10px"
          @change="fetchTaskLog"
        >
          <template #append>条</template>
        </el-input-number>
        <el-button type="primary" @click="fetchTaskLog">刷新</el-button>
      </div>

      <el-input
        v-model="taskLog"
        type="textarea"
        :rows="20"
        readonly
        placeholder="加载中..."
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="logDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 导出日志对话框 -->
    <el-dialog v-model="exportDialogVisible" title="导出数据" width="400px">
      <el-form>
        <el-form-item label="导出路径">
          <el-input v-model="exportPath" placeholder="请输入导出路径" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="exportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="exportTaskLog">确认导出</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 完成任务对话框 -->
    <el-dialog v-model="finishDialogVisible" title="完成任务" width="400px">
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="finishDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="finishTaskDialog">确认</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import { getTaskList, getTaskLog, finishTask, exportTask } from "../api/task";

// 定义任务数据类型
interface Task {
  id: number;
  name: string;
  userId: number;
  userName: string;
  gpuDeviceId: string;
  status: string;
  startTime: string;
  endTime: string;
  actualDurationHours: number;
}

// 响应式变量
const activeTab = ref("myTasks");
const myTasks = ref<Task[]>([]);
const tasksLoading = ref(false);
const logDialogVisible = ref(false);
const taskLog = ref("");
const currentTaskId = ref<number | null>(null);

const exportDialogVisible = ref(false);
const exportPath = ref("/workspace");

const finishDialogVisible = ref(false);

const taskFilters = ref({
  keyword: "",
  status: "",
});

const taskPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const logNum = ref(10);

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "";
  return new Date(dateTime).toLocaleString("zh-CN");
};

// 获取任务状态类型
const getTaskStatusType = (status: string) => {
  switch (status) {
    case "RUNNING":
      return "success";
    case "FINISHED":
      return "warning";
    case "CANCELLED":
      return "info";
    default:
      return "info";
  }
};

// 获取任务状态文本
const getTaskStatusText = (status: string) => {
  switch (status) {
    case "RUNNING":
      return "运行中";
    case "FINISHED":
      return "已完成";
    default:
      return status;
  }
};

// 获取我的任务列表
const fetchMyTaskList = async () => {
  tasksLoading.value = true;
  try {
    const params: any = {
      page: taskPagination.value.currentPage,
      size: taskPagination.value.pageSize,
    };

    // 添加搜索条件
    if (taskFilters.value.keyword) {
      params.keyword = taskFilters.value.keyword;
    }
    if (taskFilters.value.status) {
      params.status = taskFilters.value.status;
    }

    const response = await getTaskList(params);
    myTasks.value = response.data?.list || [];
    taskPagination.value.total = response.data?.total || 0;
  } catch (error) {
    ElMessage.error("获取我的任务列表失败");
    console.error("获取我的任务列表失败:", error);
  } finally {
    tasksLoading.value = false;
  }
};
// 显示导出对话框
const showExportDialog = (row: Task) => {
  currentTaskId.value = row.id; // 设置当前任务ID
  exportDialogVisible.value = true;
  exportPath.value = "/workspace"; // 设置默认路径
};
// 查看任务日志
const viewTaskLog = async (row: Task) => {
  try {
    currentTaskId.value = row.id;
    logDialogVisible.value = true;
    taskLog.value = "加载中...";

    const params = {
      taskId: row.id,
      logNum: logNum.value,
    };
    const response = await getTaskLog(params);
    taskLog.value = response.data || "暂无日志";
  } catch (error) {
    ElMessage.error("获取任务日志失败");
    console.error("获取任务日志失败:", error);
    taskLog.value = "获取日志失败";
  }
};

// 获取任务日志
const fetchTaskLog = async () => {
  if (!currentTaskId.value) return;

  try {
    const params = {
      taskId: currentTaskId.value,
      logNum: logNum.value,
    };

    const response = await getTaskLog(params);
    taskLog.value = response.data || "暂无日志";
  } catch (error) {
    ElMessage.error("获取任务日志失败");
    console.error("获取任务日志失败:", error);
    taskLog.value = "获取日志失败";
  }
};
// 结束任务
const finishTaskHandler = (row: Task) => {
  ElMessageBox.confirm(`确定要结束任务 ${row.name} 吗？`, "确认结束任务", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      try {
        const params = {
          taskId: row.id,
        };

        await finishTask(params);
        ElMessage.success("任务结束成功");
        fetchMyTaskList();
      } catch (error) {
        ElMessage.error("任务结束失败");
        console.error("任务结束失败:", error);
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 导出任务日志
const exportTaskLog = async () => {
  if (!currentTaskId.value) {
    ElMessage.warning("没有选中的任务");
    return;
  }

  if (!exportPath.value) {
    ElMessage.warning("请输入导出路径");
    return;
  }

  try {
    const params = {
      taskId: currentTaskId.value,
      path: exportPath.value,
    };

    const response = await exportTask(params);

    // 创建下载链接并触发下载
    const blob = new Blob([response.data], {
      type: "application/octet-stream",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const filename = exportPath.value.split("/").pop() || "export.zip";
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    ElMessage.success("日志导出成功");
    exportDialogVisible.value = false;
  } catch (error) {
    ElMessage.error("日志导出失败");
    console.error("日志导出失败:", error);
  }
};

const showFinishTaskDialog  = async (row: Task) => {
  currentTaskId.value = row.id;
  finishDialogVisible.value = true;
  try {
    const params = {
      taskId: currentTaskId.value,
    };

    await finishTask(params);
    ElMessage.success("任务结束成功");
    finishDialogVisible.value = false;
    fetchMyTaskList();
  } catch (error) {
    ElMessage.error("任务结束失败");
    console.error("任务结束失败:", error);
  }
};

// 处理日志对话框关闭
const handleLogDialogClose = () => {
  logDialogVisible.value = false;
  taskLog.value = "";
  currentTaskId.value = null;
};

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  switch (tabName) {
    case "myTasks":
      fetchMyTaskList();
      break;
  }
};

// 分页相关方法
const handleTaskSizeChange = (val: number) => {
  taskPagination.value.pageSize = val;
  fetchMyTaskList();
};

const handleTaskCurrentChange = (val: number) => {
  taskPagination.value.currentPage = val;
  fetchMyTaskList();
};

// 页面加载时获取初始数据
onMounted(() => {
  fetchMyTaskList();
});
</script>

<style scoped>
.task-container {
  padding: 20px;
}

.task-tabs {
  width: 100%;
}

.task-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  text-align: right;
}

.log-header {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  align-content: center;
  gap: 25px;
  margin-bottom: 10px;
}
</style>
