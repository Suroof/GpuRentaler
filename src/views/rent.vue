<template>
  <div class="gpu-container">
    <el-card class="gpu-card">
      <template #header>
        <div class="card-header">
          <span>可租用GPU设备</span>
          <el-button type="primary" @click="fetchRentableDevices">刷新</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElForm } from "element-plus";
import { getRentableGpuDevices, leaseGpuDevice } from "../api/gpu";
import { Table, Button } from 'ant-design-vue';

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

// 响应式变量
const rentableDevices = ref<GpuDevice[]>([]);
const rentableLoading = ref(false);
const leaseDeviceDialogVisible = ref(false);
const leaseLoading = ref(false);
const leaseFormRef = ref<InstanceType<typeof ElForm>>();

const leaseFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

const leaseForm = ref({
  deviceId: "",
  model: "",
  hourlyRate: "",
  duration: 1,
});

const rentablePagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

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

    // 刷新数据
    fetchRentableDevices();
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

// 分页相关方法
const handleRentableSizeChange = (val: number) => {
  rentablePagination.value.pageSize = val;
  fetchRentableDevices();
};

const handleRentableCurrentChange = (val: number) => {
  rentablePagination.value.currentPage = val;
  fetchRentableDevices();
};

// 页面加载时获取初始数据
onMounted(() => {
  fetchRentableDevices();
});
</script>

<style scoped>
.gpu-container {
  padding: 20px;
}

.gpu-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
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
