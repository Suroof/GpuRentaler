<template>
  <div class="server-container">
    <el-card class="server-card">
      <template #header>
        <div class="card-header">
          <span>服务器管理</span>
          <el-button type="primary" @click="handleRefresh">刷新</el-button>
        </div>
      </template>

      <!-- 服务器列表 -->
      <el-table
        :data="serverList"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column
          prop="id"
          label="服务器ID"
          width="80"
        ></el-table-column>
        <el-table-column
          prop="hostname"
          label="主机名"
          width="120"
        ></el-table-column>
        <el-table-column
          prop="ipAddress"
          label="IP地址"
          width="150"
        ></el-table-column>
        <el-table-column
          prop="cpuModel"
          label="CPU型号"
          show-overflow-tooltip
        ></el-table-column>
        <el-table-column
          prop="cpuCores"
          label="CPU核心数"
          width="100"
        ></el-table-column>
        <el-table-column prop="ramTotalGb" label="内存(GB)" width="100">
          <template #default="scope"> {{ scope.row.ramTotalGb }} GB </template>
        </el-table-column>
        <el-table-column prop="storageTotalGb" label="存储(GB)" width="100">
          <template #default="scope">
            {{ scope.row.storageTotalGb }} GB
          </template>
        </el-table-column>
        <el-table-column
          prop="gpuSlots"
          label="GPU插槽数"
          width="100"
        ></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === 'ONLINE' ? 'success' : 'danger'"
            >
              {{ scope.row.status === "ONLINE" ? "在线" : "离线" }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right" background-color="#fff !important">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              编辑
            </el-button>
            <el-button
              size="small"
              type="primary"
              @click="handleModify(scope.row)"
            >
              更新
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 编辑服务器对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑服务器"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        ref="serverFormRef"
        :model="serverForm"
        :rules="serverFormRules"
        label-width="100px"
      >
        <el-form-item label="主机名" prop="hostname">
          <el-input v-model="serverForm.hostname" placeholder="请输入主机名" />
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="serverForm.ipAddress" placeholder="请输入IP地址" />
        </el-form-item>
        <el-form-item label="CPU型号" prop="cpuModel">
          <el-input v-model="serverForm.cpuModel" placeholder="请输入CPU型号" />
        </el-form-item>
        <el-form-item label="CPU核心数" prop="cpuCores">
          <el-input-number
            v-model="serverForm.cpuCores"
            :min="1"
            :max="128"
            placeholder="请输入CPU核心数"
          />
        </el-form-item>
        <el-form-item label="内存(GB)" prop="ramTotalGb">
          <el-input-number
            v-model="serverForm.ramTotalGb"
            :min="1"
            :max="1024"
            placeholder="请输入内存大小(GB)"
          />
        </el-form-item>
        <el-form-item label="存储(GB)" prop="storageTotalGb">
          <el-input-number
            v-model="serverForm.storageTotalGb"
            :min="1"
            :max="10000"
            placeholder="请输入存储大小(GB)"
          />
        </el-form-item>
        <el-form-item label="GPU插槽数" prop="gpuSlots">
          <el-input-number
            v-model="serverForm.gpuSlots"
            :min="0"
            :max="16"
            placeholder="请输入GPU插槽数"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="serverForm.status" placeholder="请选择状态">
            <el-option label="在线" value="ONLINE" />
            <el-option label="离线" value="OFFLINE" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitServerForm"
            :loading="submitLoading"
          >
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox, ElForm } from "element-plus";
import { getServerList, addServer, delServer } from "../api/server";

// 定义服务器数据类型
interface Server {
  id: number;
  hostname: string;
  ipAddress: string;
  location: string | null;
  cpuModel: string;
  cpuCores: number;
  ramTotalGb: number;
  storageTotalGb: number;
  gpuSlots: number;
  status: string; // 'ONLINE' 或 'OFFLINE'
  datacenter: string | null;
  region: string | null;
}

// 数据响应式变量
const serverList = ref<Server[]>([]);
const loading = ref(false);
const submitLoading = ref(false);
const editDialogVisible = ref(false);

// 表单相关
const serverFormRef = ref<InstanceType<typeof ElForm>>();
const serverForm = ref({
  id: 0,
  hostname: "",
  ipAddress: "",
  cpuModel: "",
  cpuCores: 1,
  ramTotalGb: 1,
  storageTotalGb: 1,
  gpuSlots: 0,
  status: "OFFLINE",
});

// 表单验证规则
const serverFormRules = {
  hostname: [{ required: true, message: "请输入主机名", trigger: "blur" }],
  ipAddress: [
    { required: true, message: "请输入IP地址", trigger: "blur" },
    {
      pattern: /^(\d{1,3}\.){3}\d{1,3}$/,
      message: "请输入正确的IP地址格式",
      trigger: "blur",
    },
  ],
  cpuModel: [{ required: true, message: "请输入CPU型号", trigger: "blur" }],
  cpuCores: [{ required: true, message: "请输入CPU核心数", trigger: "blur" }],
  ramTotalGb: [{ required: true, message: "请输入内存大小", trigger: "blur" }],
  storageTotalGb: [
    { required: true, message: "请输入存储大小", trigger: "blur" },
  ],
  gpuSlots: [{ required: true, message: "请输入GPU插槽数", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
};

// 分页相关
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 刷新服务器列表
const handleRefresh = () => {
  pagination.value.currentPage = 1;
  fetchServerList();
};

// 获取服务器列表
const fetchServerList = async () => {
  loading.value = true;
  try {
    const response = await getServerList();
    serverList.value = response.data.list || [];
    pagination.value.total = response.data.total || serverList.value.length;
  } catch (error) {
    ElMessage.error("获取服务器列表失败");
    console.error("获取服务器列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理编辑服务器
const handleEdit = (row: Server) => {
  serverForm.value = { ...row };
  editDialogVisible.value = true;
};

// 处理更新服务器
const handleModify = async (row: Server) => {
  try {
    // 创建服务器数据对象
    const serverData = {
      hostname: row.hostname,
      ipAddress: row.ipAddress,
      cpuModel: row.cpuModel,
      cpuCores: row.cpuCores,
      ramTotalGb: row.ramTotalGb,
      storageTotalGb: row.storageTotalGb,
      gpuSlots: row.gpuSlots,
      status: row.status,
    };

    await addServer(row.id, serverData);
    ElMessage.success("服务器更新成功");
    fetchServerList();
  } catch (error) {
    ElMessage.error("服务器更新失败");
    console.error("服务器更新失败:", error);
  }
};

// 处理删除服务器
const handleDelete = async (row: Server) => {
  ElMessageBox.confirm(
    `确定要删除服务器 "${row.hostname}" 吗？此操作不可恢复！`,
    "确认删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        await delServer(row.id);
        ElMessage.success("删除成功");
        fetchServerList();
      } catch (error) {
        ElMessage.error("删除失败");
        console.error("删除服务器失败:", error);
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 提交服务器表单
const submitServerForm = async () => {
  if (!serverFormRef.value) return;

  await serverFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true;
      try {
        // 创建服务器数据对象
        const serverData = {
          hostname: serverForm.value.hostname,
          ipAddress: serverForm.value.ipAddress,
          cpuModel: serverForm.value.cpuModel,
          cpuCores: serverForm.value.cpuCores,
          ramTotalGb: serverForm.value.ramTotalGb,
          storageTotalGb: serverForm.value.storageTotalGb,
          gpuSlots: serverForm.value.gpuSlots,
          status: serverForm.value.status,
        };

        await addServer(serverForm.value.id, serverData);
        ElMessage.success("服务器更新成功");
        editDialogVisible.value = false;
        fetchServerList();
      } catch (error) {
        ElMessage.error("服务器更新失败");
        console.error("服务器更新失败:", error);
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 处理对话框关闭
const handleDialogClose = () => {
  serverFormRef.value?.resetFields();
};

// 分页相关方法
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val;
  fetchServerList();
};

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val;
  fetchServerList();
};

// 页面加载时获取服务器列表
onMounted(() => {
  fetchServerList();
});
</script>

<style scoped>
.server-container {
  padding: 20px;
}

.server-card {
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

.el-table__cell {
  background-color: #fff !important;
}

/* 修改 el-table 单元格背景颜色 */
.el-table__body td.el-table__cell {
  background-color: #fff !important;
}

/* 确保所有状态下的单元格都有白色背景 */
.el-table__body td.el-table__cell:hover {
  background-color: #fff !important;
}

/* 修改固定列的单元格背景颜色 */
.el-table__fixed-right .el-table__body td.el-table__cell {
  background-color: #fff !important;
}

/* 修改表头单元格背景颜色 */
.el-table__header th.el-table__cell {
  background-color: #f5f7fa !important;
}
</style>
