<template>
  <div class="gpu-container">
    <el-tabs v-model="activeTab" class="gpu-tabs" @tab-change="handleTabChange">
      <!-- GPU设备管理 -->
      <el-tab-pane label="GPU设备管理" name="devices">
        <el-card class="gpu-card">
          <template #header>
            <div class="card-header">
              <span>GPU设备列表</span>
              <div class="header-actions">
                <el-input
                  v-model="deviceFilters.keyword"
                  placeholder="搜索设备ID、型号"
                  style="width: 200px; margin-right: 10px"
                  clearable
                  @clear="fetchGpuDevices"
                >
                  <template #append>
                    <el-button :icon="Search" @click="fetchGpuDevices" />
                  </template>
                </el-input>
                <el-select
                  v-model="deviceFilters.status"
                  placeholder="设备状态"
                  style="width: 120px; margin-right: 10px"
                  clearable
                  @change="fetchGpuDevices"
                >
                  <el-option label="可用" value="ONLINE" />
                  <el-option label="已租用" value="OFFLINE" />
                  <el-option label="未知" value="UNKNOWN" />
                </el-select>
                <el-button type="primary" @click="fetchGpuDevices"
                  >刷新</el-button
                >
              </div>
            </div>
          </template>

          <a-table
            :data-source="gpuDevices"
            :loading="devicesLoading"
            :pagination="false"
            :scroll="{ x: 'max-content' }"
            bordered
            size="middle"
          >
            <a-table-column key="deviceId" title="设备ID" data-index="deviceId" :width="120" />
            <a-table-column key="brand" title="品牌" data-index="brand" :width="100" />
            <a-table-column key="model" title="型号" data-index="model" :width="120" />
            <a-table-column key="memoryTotal" title="显存(MB)" data-index="memoryTotal" :width="100">
              <template #default="{ text }">
                {{ text }}
              </template>
            </a-table-column>
            <a-table-column key="architecture" title="架构" data-index="architecture" :width="120" />
            <a-table-column key="status" title="状态" :width="100">
              <template #default="{ record }">
                <a-tag :color="getDeviceStatusType(record.status)">
                  {{ getDeviceStatusText(record.status) }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column key="isRentable" title="可租用" :width="80">
              <template #default="{ record }">
                <a-tag :color="record.isRentable ? 'green' : 'red'">
                  {{ record.isRentable ? "是" : "否" }}
                </a-tag>
              </template>
            </a-table-column>
            <a-table-column key="hourlyRate" title="时价($)" data-index="hourlyRate" :width="100" />
            <a-table-column key="totalRevenue" title="总收入($)" data-index="totalRevenue" :width="100" />
            <a-table-column key="actions" title="操作" :width="200" fixed="right">
              <template #default="{ record }">
                <a-button size="small" @click="handleEditDevice(record)" style="margin-right: 5px">
                  编辑
                </a-button>
                <a-button
                  size="small"
                  type="primary"
                  :disabled="!record.isRentable || record.status !== 'AVAILABLE'"
                  @click="handleLeaseDevice(record)"
                  style="margin-right: 5px"
                >
                  租用
                </a-button>
                <a-button
                  size="small"
                  danger
                  @click="handleDeleteDevice(record)"
                >
                  删除
                </a-button>
              </template>
            </a-table-column>
          </a-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="devicePagination.currentPage"
              v-model:page-size="devicePagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="devicePagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleDeviceSizeChange"
              @current-change="handleDeviceCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 可租用设备 -->
      <el-tab-pane label="可租用设备" name="rentable">
        <el-card class="gpu-card">
          <template #header>
            <div class="card-header">
              <span>可租用GPU设备</span>
              <el-button type="primary" @click="fetchRentableDevices"
                >刷新</el-button
              >
            </div>
          </template>

          <a-table
            :data-source="rentableDevices"
            :loading="rentableLoading"
            :pagination="false"
            :scroll="{ x: 'max-content' }"
            bordered
            size="middle"
          >
            <a-table-column key="deviceId" title="设备ID" data-index="deviceId" :width="120" />
            <a-table-column key="brand" title="品牌" data-index="brand" :width="100" />
            <a-table-column key="model" title="型号" data-index="model" :width="120" />
            <a-table-column key="memoryTotal" title="显存(MB)" data-index="memoryTotal" :width="100" />
            <a-table-column key="architecture" title="架构" data-index="architecture" :width="120" />
            <a-table-column key="hourlyRate" title="时价($)" data-index="hourlyRate" :width="100" />
            <a-table-column key="actions" title="操作" :width="150" fixed="right">
              <template #default="{ record }">
                <a-button
                  size="small"
                  type="primary"
                  @click="handleLeaseDevice(record)"
                >
                  租用
                </a-button>
              </template>
            </a-table-column>
          </a-table>

          <div class="pagination-container">
            <el-pagination
              v-model:current-page="rentablePagination.currentPage"
              v-model:page-size="rentablePagination.pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="rentablePagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleRentableSizeChange"
              @current-change="handleRentableCurrentChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 编辑设备对话框 -->
    <el-dialog
      v-model="editDeviceDialogVisible"
      :title="editDeviceDialogTitle"
      width="600px"
      @close="handleEditDeviceDialogClose"
    >
      <el-form
        ref="deviceFormRef"
        :model="deviceForm"
        :rules="deviceFormRules"
        label-width="120px"
      >
        <el-form-item label="设备ID" prop="deviceId">
          <el-input v-model="deviceForm.deviceId" disabled />
        </el-form-item>
        <el-form-item label="设备索引" prop="deviceIndex">
          <el-input-number v-model="deviceForm.deviceIndex" :min="0" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="deviceForm.brand" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="deviceForm.model" />
        </el-form-item>
        <el-form-item label="总显存(MB)" prop="memoryTotal">
          <el-input-number v-model="deviceForm.memoryTotal" :min="0" />
        </el-form-item>
        <el-form-item label="架构" prop="architecture">
          <el-input v-model="deviceForm.architecture" />
        </el-form-item>
        <el-form-item label="显存类型" prop="memoryType">
          <el-input v-model="deviceForm.memoryType" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="deviceForm.status">
            <el-option label="可用" value="ONLINE" />
            <el-option label="已租用" value="OFFLINE" />
            <el-option label="未知" value="UNKNOWN" />
          </el-select>
        </el-form-item>
        <el-form-item label="可租用" prop="isRentable">
          <el-switch v-model="deviceForm.isRentable" />
        </el-form-item>
        <el-form-item label="时价($)" prop="hourlyRate">
          <el-input v-model="deviceForm.hourlyRate" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDeviceDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitDeviceForm"
            :loading="deviceFormLoading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 租用设备对话框 -->
    <el-dialog
      v-model="leaseDeviceDialogVisible"
      title="租用GPU设备"
      width="500px"
      @close="handleLeaseDialogClose"
    >
      <el-form ref="leaseFormRef" :model="leaseForm" label-width="120px">
        <el-form-item label="设备ID">
          <el-input v-model="leaseForm.deviceId" disabled />
        </el-form-item>
        <el-form-item label="型号">
          <el-input v-model="leaseForm.model" disabled />
        </el-form-item>
        <el-form-item label="时价($)">
          <el-input v-model="leaseForm.hourlyRate" disabled />
        </el-form-item>
        <el-form-item label="预计租用时长">
          <el-input-number
            v-model="leaseForm.duration"
            :min="1"
            :max="168"
            :step="1"
            step-strictly
          >
            <template #append>小时</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="上传配置文件">
          <input
            ref="fileInputRef"
            type="file"
            accept=".tar,.tar.gz,.tgz"
            @change="handleFileChange"
            style="width: 100%"
          />
          <div v-if="leaseFile" class="file-info">
            <span>已选择: {{ leaseFile.name }}</span>
            <el-button
              type="danger"
              size="small"
              @click="clearFileSelection"
              style="margin-left: 10px"
            >
              清除
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="leaseDeviceDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="confirmLeaseDevice"
            :loading="leaseLoading"
          >
            确认租用
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 租用详情对话框 -->
    <el-dialog
      v-model="leaseDetailDialogVisible"
      title="租用详情"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="设备ID">
          {{ leaseDetail.gpuDevice?.deviceId }}
        </el-descriptions-item>
        <el-descriptions-item label="型号">
          {{ leaseDetail.gpuDevice?.model }}
        </el-descriptions-item>
        <el-descriptions-item label="开始时间">
          {{ formatDateTime(leaseDetail.startTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="结束时间">
          {{ formatDateTime(leaseDetail.endTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="时长(小时)">
          {{ leaseDetail.actualDurationHours }}
        </el-descriptions-item>
        <el-descriptions-item label="时价($)">
          {{ leaseDetail.hourlyRate }}
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getLeaseStatusType(leaseDetail.status)">
            {{ getLeaseStatusText(leaseDetail.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="leaseDetail.sshUsername" label="SSH用户名">
          {{ leaseDetail.sshUsername }}
        </el-descriptions-item>
        <el-descriptions-item v-if="leaseDetail.sshPassword" label="SSH密码">
          {{ leaseDetail.sshPassword }}
        </el-descriptions-item>
        <el-descriptions-item v-if="leaseDetail.sshIp" label="SSH地址">
          {{ leaseDetail.sshIp }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="leaseDetailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox, ElForm } from "element-plus";
import { Search } from "@element-plus/icons-vue";
import {
  getGpuDeviceList,
  getRentableGpuDevices,
  leaseGpuDevice,
  returnGpuDevice,
  updateGpuDevice,
  deleteGpuDevice,
  getMyLeaseRecords,
  getAllLeaseRecords,
} from "../api/gpu";

import { Table, Button, Tag } from 'ant-design-vue';
import type { TableProps } from 'ant-design-vue';

// 定义数据类型
interface GpuDevice {
  deviceId: string;
  deviceIndex: number;
  brand: string;
  model: string;
  memoryTotal: number;
  architecture: string;
  memoryType: string;
  status: string;
  isRentable: boolean;
  hourlyRate: string;
  totalRuntimeHours: string;
  totalRevenue: string;
}

interface LeaseRecord {
  gpuDevice: {
    deviceId: string;
    brand: string;
    model: string;
    memoryTotal: number;
  };
  userId: number;
  gpuDeviceId: string;
  startTime: string;
  endTime: string;
  plannedDurationHours: string;
  actualDurationHours: string;
  hourlyRate: string;
  status: string;
  sshIp?: string;
  sshUsername?: string;
  sshPassword?: string;
}

// 响应式变量
const activeTab = ref("devices");

// 设备管理相关
const gpuDevices = ref<GpuDevice[]>([]);
const devicesLoading = ref(false);
const editDeviceDialogVisible = ref(false);
const editDeviceDialogTitle = ref("");
const deviceFormLoading = ref(false);
const deviceFormRef = ref<InstanceType<typeof ElForm>>();
const leaseDeviceDialogVisible = ref(false);
const leaseLoading = ref(false);
const leaseFormRef = ref<InstanceType<typeof ElForm>>();

const leaseFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const deviceFilters = ref({
  keyword: "",
  status: "",
});

const deviceForm = ref({
  deviceId: "",
  deviceIndex: 0,
  brand: "",
  model: "",
  memoryTotal: 0,
  architecture: "",
  memoryType: "",
  status: "AVAILABLE",
  isRentable: true,
  hourlyRate: "0.00",
});

const leaseForm = ref({
  deviceId: "",
  model: "",
  hourlyRate: "",
  duration: 1,
});

const deviceFormRules = {
  brand: [{ required: true, message: "请输入品牌", trigger: "blur" }],
  model: [{ required: true, message: "请输入型号", trigger: "blur" }],
  memoryTotal: [{ required: true, message: "请输入总显存", trigger: "blur" }],
  architecture: [{ required: true, message: "请输入架构", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

const devicePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 可租用设备相关
const rentableDevices = ref<GpuDevice[]>([]);
const rentableLoading = ref(false);

const rentablePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 我的租用记录相关
const myLeaseRecords = ref<LeaseRecord[]>([]);
const myLeaseLoading = ref(false);
const leaseDetailDialogVisible = ref(false);
const leaseDetail = ref({} as LeaseRecord);

const myLeasePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 所有租用记录相关
const allLeaseRecords = ref<LeaseRecord[]>([]);
const allLeaseLoading = ref(false);

const allLeasePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "";
  return new Date(dateTime).toLocaleString("zh-CN");
};

// 获取设备状态类型
const getDeviceStatusType = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "green";
    case "LEASED":
      return "orange";
    case "MAINTENANCE":
      return "blue";
    case "FAULT":
      return "red";
    default:
      return "default";
  }
};

// 获取设备状态文本
const getDeviceStatusText = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "可用";
    case "LEASED":
      return "已租用";
    case "MAINTENANCE":
      return "维护中";
    case "FAULT":
      return "故障";
    default:
      return status;
  }
};

// 获取租用状态类型
const getLeaseStatusType = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "COMPLETED":
      return "blue";
    case "CANCELLED":
      return "orange";
    default:
      return "default";
  }
};

// 获取租用状态文本
const getLeaseStatusText = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return "进行中";
    case "COMPLETED":
      return "已完成";
    case "CANCELLED":
      return "已取消";
    default:
      return status;
  }
};

// 添加处理文件选择的方法
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    leaseFile.value = target.files[0];
  } else {
    leaseFile.value = null;
  }
};

// 添加清除文件选择的方法
const clearFileSelection = () => {
  leaseFile.value = null;
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};
// 获取GPU设备列表
const fetchGpuDevices = async () => {
  devicesLoading.value = true;
  try {
    // 构建参数对象，只添加有值的参数
    const params: any = {
      page: devicePagination.value.currentPage,
      size: devicePagination.value.pageSize,
    };

    // 只有当keyword有值时才添加到参数中
    if (deviceFilters.value.keyword) {
      params.keyword = deviceFilters.value.keyword;
    }

    // 只有当status有值时才添加到参数中
    if (deviceFilters.value.status) {
      params.status = deviceFilters.value.status;
    }

    const response = await getGpuDeviceList(params);
    gpuDevices.value = response.data.data?.list || response.data.list || [];
    devicePagination.value.total =
      response.data.data?.total ||
      response.data.total ||
      gpuDevices.value.length;
  } catch (error) {
    ElMessage.error("获取GPU设备列表失败");
    console.error("获取GPU设备列表失败:", error);
  } finally {
    devicesLoading.value = false;
  }
};

// 获取可租用GPU设备
const fetchRentableDevices = async () => {
  rentableLoading.value = true;
  try {
    const params = {
      page: rentablePagination.value.currentPage,
      size: rentablePagination.value.pageSize,
    };

    const response = await getRentableGpuDevices(params);
    rentableDevices.value =
      response.data.data?.list || response.data.list || [];
    rentablePagination.value.total =
      response.data.data?.total ||
      response.data.total ||
      rentableDevices.value.length;
  } catch (error) {
    ElMessage.error("获取可租用GPU设备失败");
    console.error("获取可租用GPU设备失败:", error);
  } finally {
    rentableLoading.value = false;
  }
};

// 处理标签页切换
const handleTabChange = (tabName: string) => {
  switch (tabName) {
    case "devices":
      fetchGpuDevices();
      break;
    case "rentable":
      fetchRentableDevices();
      break;
    case "myLease":
      fetchMyLeaseRecords();
      break;
    case "allLease":
      fetchAllLeaseRecords();
      break;
  }
};

// 处理编辑设备
const handleEditDevice = (row: GpuDevice) => {
  editDeviceDialogTitle.value = "编辑GPU设备";
  deviceForm.value = { ...row };
  editDeviceDialogVisible.value = true;
};

// 处理租用设备
const handleLeaseDevice = (row: GpuDevice) => {
  leaseForm.value = {
    deviceId: row.deviceId,
    model: row.model,
    hourlyRate: row.hourlyRate,
    duration: 1,
  };
  leaseDeviceDialogVisible.value = true;
};

// 确认租用设备
const confirmLeaseDevice = async () => {
  if (!leaseFormRef.value) return;

  leaseLoading.value = true;
  try {
    // 准备数据
    const data = {
      duration: leaseForm.value.duration,
    };

    // 调用租用方法，传递文件和数据
    await leaseGpuDevice(
      leaseForm.value.deviceId,
      leaseFile.value || undefined,
      data
    );
    ElMessage.success("设备租用成功");
    leaseDeviceDialogVisible.value = false;

    // 清除文件选择
    clearFileSelection();

    // 刷新相关数据
    handleTabChange(activeTab.value);
  } catch (error) {
    ElMessage.error("设备租用失败");
    console.error("设备租用失败:", error);
  } finally {
    leaseLoading.value = false;
  }
};

const handleLeaseDialogClose = () => {
  clearFileSelection();
  if (leaseFormRef.value) {
    leaseFormRef.value.resetFields();
  }
};
// 处理归还设备
const handleReturnDevice = (row: LeaseRecord) => {
  ElMessageBox.confirm(
    `确定要归还设备 ${row.gpuDevice.deviceId} 吗？`,
    "确认归还",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        await returnGpuDevice(row.gpuDeviceId);
        ElMessage.success("设备归还成功");
        // 刷新相关数据
        handleTabChange(activeTab.value);
      } catch (error) {
        ElMessage.error("设备归还失败");
        console.error("设备归还失败:", error);
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 处理删除设备
const handleDeleteDevice = (row: GpuDevice) => {
  ElMessageBox.confirm(
    `确定要删除设备 ${row.deviceId} 吗？此操作不可恢复！`,
    "确认删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        await deleteGpuDevice(row.deviceId);
        ElMessage.success("设备删除成功");
        fetchGpuDevices();
      } catch (error) {
        ElMessage.error("设备删除失败");
        console.error("设备删除失败:", error);
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 提交设备表单
const submitDeviceForm = async () => {
  if (!deviceFormRef.value) return;

  await deviceFormRef.value.validate(async (valid) => {
    if (valid) {
      deviceFormLoading.value = true;
      try {
        const data = {
          deviceIndex: deviceForm.value.deviceIndex,
          brand: deviceForm.value.brand,
          model: deviceForm.value.model,
          memoryTotal: deviceForm.value.memoryTotal,
          architecture: deviceForm.value.architecture,
          memoryType: deviceForm.value.memoryType,
          status: deviceForm.value.status,
          isRentable: deviceForm.value.isRentable,
          hourlyRate: deviceForm.value.hourlyRate,
        };

        await updateGpuDevice(deviceForm.value.deviceId, data);
        ElMessage.success("设备信息更新成功");
        editDeviceDialogVisible.value = false;
        fetchGpuDevices();
      } catch (error) {
        ElMessage.error("设备信息更新失败");
        console.error("设备信息更新失败:", error);
      } finally {
        deviceFormLoading.value = false;
      }
    }
  });
};

// 显示租用详情
const showLeaseDetail = (row: LeaseRecord) => {
  leaseDetail.value = { ...row };
  leaseDetailDialogVisible.value = true;
};

// 处理编辑设备对话框关闭
const handleEditDeviceDialogClose = () => {
  deviceFormRef.value?.resetFields();
};

// 分页相关方法 - 设备列表
const handleDeviceSizeChange = (val: number) => {
  devicePagination.value.pageSize = val;
  fetchGpuDevices();
};

const handleDeviceCurrentChange = (val: number) => {
  devicePagination.value.currentPage = val;
  fetchGpuDevices();
};

// 分页相关方法 - 可租用设备
const handleRentableSizeChange = (val: number) => {
  rentablePagination.value.pageSize = val;
  fetchRentableDevices();
};

const handleRentableCurrentChange = (val: number) => {
  rentablePagination.value.currentPage = val;
  fetchRentableDevices();
};

// 分页相关方法 - 我的租用记录
const handleMyLeaseSizeChange = (val: number) => {
  myLeasePagination.value.pageSize = val;
  fetchMyLeaseRecords();
};

const handleMyLeaseCurrentChange = (val: number) => {
  myLeasePagination.value.currentPage = val;
  fetchMyLeaseRecords();
};

// 分页相关方法 - 所有租用记录
const handleAllLeaseSizeChange = (val: number) => {
  allLeasePagination.value.pageSize = val;
  fetchAllLeaseRecords();
};

const handleAllLeaseCurrentChange = (val: number) => {
  allLeasePagination.value.currentPage = val;
  fetchAllLeaseRecords();
};

// 页面加载时获取初始数据
onMounted(() => {
  fetchGpuDevices();
});
</script>

<style scoped>
.gpu-container {
  padding: 20px;
}

.gpu-tabs {
  width: 100%;
}

.gpu-card {
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
</style>
