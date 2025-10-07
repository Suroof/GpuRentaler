<template>
  <div class="docker-container">
    <el-card class="docker-card">
      <template #header>
        <div class="card-header">
          <span>Docker镜像管理</span>
          <div class="header-actions">
            <el-button type="primary" @click="openUploadDialog">
              上传镜像
            </el-button>
            <el-input
              v-model="searchKeyword"
              placeholder="搜索镜像名称"
              style="width: 200px; margin-right: 10px; margin-left: 10px"
              clearable
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #append>
                <el-button :icon="Search" @click="handleSearch" />
              </template>
            </el-input>
            <el-button type="primary" :icon="Refresh" @click="handleRefresh">
              刷新
            </el-button>
          </div>
        </div>
      </template>

      <!-- Docker镜像列表 -->
      <el-table
        :data="dockerImages"
        v-loading="loading"
        style="width: 100%"
        stripe
      >
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="镜像名称" show-overflow-tooltip>
          <template #default="scope">
            <span class="image-name">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="tag" label="创建者" width="120">
          <template #default="scope">
            <el-tag type="success">{{ scope.row.createUser }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="大小" width="120">
          <template #default="scope">
            {{ formatSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              type="primary"
              @click="handleUse(scope.row)"
            >
              使用
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
            <el-button size="small" @click="handleView(scope.row)">
              查看
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

    <!-- 镜像详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="`镜像详情 - ${currentImage.name}:${currentImage.tag}`"
      width="600px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">
          {{ currentImage.id }}
        </el-descriptions-item>
        <el-descriptions-item label="镜像名称">
          {{ currentImage.name }}
        </el-descriptions-item>
        <el-descriptions-item label="createUser">
          <el-tag type="success">{{ currentImage.createUser }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="大小">
          {{ formatSize(currentImage.size) }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(currentImage.createTime) }}
        </el-descriptions-item>
        <el-descriptions-item label="描述" v-if="currentImage.description">
          {{ currentImage.description }}
        </el-descriptions-item>
      </el-descriptions>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button type="primary" @click="handleUse(currentImage)">
            使用镜像
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传镜像对话框 -->
    <el-dialog
      v-model="uploadDialogVisible"
      title="上传Docker镜像"
      width="500px"
    >
      <el-form ref="uploadFormRef" :model="uploadForm" label-width="120px">
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            action=""
            :auto-upload="false"
            :on-change="handleChange"
            :on-remove="handleRemove"
            accept=".tar,.tar.gz,.tgz"
            :limit="1"
            :file-list="uploadFileList"
            drag
          >
            <el-icon><Upload /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或点击上传</div>
            <div class="el-upload__tip" slot="tip">
              只支持.tar、.tar.gz、.tgz格式的文件
            </div>
          </el-upload>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitUpload"
            :disabled="!uploadFileList.length"
          >
            确认上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Upload } from "@element-plus/icons-vue";
import { getDockerList, uploadDocker } from "../api/docker";
import type { UploadInstance, UploadProps, UploadUserFile } from "element-plus";

// 定义Docker镜像数据类型
interface DockerImage {
  id: number;
  name: string;
  tag: string;
  size: number; // 以字节为单位
  createdAt: string;
  createTime: string;
  createUser: string;
  description?: string;
  key?: string;
}

// 数据响应式变量
const dockerImages = ref<DockerImage[]>([]);
const loading = ref(false);
const detailDialogVisible = ref(false);
const searchKeyword = ref("");
const uploadDialogVisible = ref(false);

// 上传相关的引用
const uploadRef = ref<UploadInstance>();
const uploadFileList = ref<UploadUserFile[]>([]);
const uploadFormRef = ref();

// 当前选中的镜像
const currentImage = ref<DockerImage>({
  id: 0,
  name: "",
  tag: "",
  size: 0,
  createdAt: "",
  createTime: "",
  createUser: "",
  description: "",
  key: "",
});

// 分页相关
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 上传Docker镜像按钮点击事件
const openUploadDialog = () => {
  uploadDialogVisible.value = true;
  // 清空之前选择的文件
  uploadFileList.value = [];
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
};

// 文件选择变化处理
const handleChange: UploadProps["onChange"] = (files, fileList) => {
  uploadFileList.value = fileList;
};

// 文件移除处理
const handleRemove: UploadProps["onRemove"] = (files, fileList) => {
  uploadFileList.value = fileList;
};

const submitUpload = async () => {
  if (!uploadFileList.value.length) {
    ElMessage.warning("请选择要上传的文件");
    return;
  }

  const files = uploadFileList.value[0].raw;
  if (!files) {
    ElMessage.error("未找到有效的文件");
    return;
  }

  try{
    const formData = new FormData();
    formData.append("files", files);

    await uploadDocker(formData);

    ElMessage.success("上传镜像成功");
    uploadDialogVisible.value = false;

    // 重新加载列表
    fetchDockerImages();
  } catch (error) {
    ElMessage.error("上传镜像失败: " + (error.message || "未知错误"));
    console.error("上传镜像失败:", error);
  }
};

// 格式化文件大小
const formatSize = (size: number) => {
  if (!size) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let sizeValue = size;

  while (sizeValue >= 1024 && unitIndex < units.length - 1) {
    sizeValue /= 1024;
    unitIndex++;
  }

  return `${sizeValue.toFixed(2)} ${units[unitIndex]}`;
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("zh-CN");
};

// 获取Docker镜像列表
const fetchDockerImages = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.currentPage,
      size: pagination.value.pageSize,
      keyword: searchKeyword.value || undefined,
    };

    const response = await getDockerList(params);
    const data = response.data.data || response.data;

    dockerImages.value = data.list || [];
    pagination.value.total = data.total || dockerImages.value.length;
  } catch (error) {
    ElMessage.error("获取Docker镜像列表失败");
    console.error("获取Docker镜像列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.currentPage = 1;
  fetchDockerImages();
};

// 刷新列表
const handleRefresh = () => {
  pagination.value.currentPage = 1;
  fetchDockerImages();
  ElMessage.success("刷新成功");
};

// 查看镜像详情
const handleView = (row: DockerImage) => {
  currentImage.value = { ...row };
  detailDialogVisible.value = true;
};

// 使用镜像
const handleUse = (row: DockerImage) => {
  ElMessageBox.confirm(
    `确定要使用镜像 "${row.name}:${row.tag}" 吗？`,
    "确认使用",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info",
    }
  )
    .then(() => {
      // 这里可以添加使用镜像的具体逻辑
      ElMessage.success(`已选择使用镜像: ${row.name}:${row.tag}`);
      detailDialogVisible.value = false;
    })
    .catch(() => {
      // 用户取消操作
    });
};

const handleDelete = (row: DockerImage) => {
  ElMessageBox.confirm(
    `确定要删除镜像 "${row.name}:${row.tag}" 吗？此操作不可恢复！`,
    "确认删除",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        ElMessage.warning("暂不支持删除Docker镜像功能");
        // await deleteDocker(row.key);
        ElMessage.success("删除成功");
        fetchDockerImages();
      } catch (error) {
        ElMessage.error("删除失败");
        console.error("删除镜像失败:", error);
      }
    })
    .catch(() => {
      // 用户取消操作
    });
};

// 分页相关方法
const handleSizeChange = (val: number) => {
  pagination.value.pageSize = val;
  fetchDockerImages();
};

const handleCurrentChange = (val: number) => {
  pagination.value.currentPage = val;
  fetchDockerImages();
};

// 页面加载时获取数据
onMounted(() => {
  fetchDockerImages();
});
</script>

<style scoped>
.docker-container {
  padding: 20px;
}

.docker-card {
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

.image-name {
  font-weight: 500;
  color: #409eff;
}
</style>
