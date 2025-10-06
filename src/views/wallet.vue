<template>
  <div class="wallet-container">
    <el-card class="wallet-card">
      <template #header>
        <div class="card-header">
          <span>我的钱包</span>
        </div>
      </template>

      <div class="wallet-info">
        <div class="balance-section">
          <div class="balance-label">账户余额</div>
          <div class="balance-amount">¥ {{ walletInfo.balance }}</div>
          <div class="last-transaction" v-if="walletInfo.lastTransactionTime">
            最后交易时间: {{ formatDateTime(walletInfo.lastTransactionTime) }}
          </div>
        </div>
      </div>

      <div class="wallet-actions">
        <el-button type="primary" @click="showRechargeDialog = true">
          充值
        </el-button>
      </div>
    </el-card>

    <!-- 充值对话框 -->
    <el-dialog v-model="showRechargeDialog" title="账户充值" width="400px">
      <el-form
        ref="rechargeFormRef"
        :model="rechargeForm"
        :rules="rechargeRules"
        label-width="80px"
      >
        <el-form-item label="充值金额" prop="amount">
          <el-input
            v-model="rechargeForm.amount"
            placeholder="请输入充值金额"
            type="number"
          >
            <template #append>元</template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRechargeDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleRecharge"
            :loading="rechargeLoading"
          >
            确认充值
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { ElMessage, ElForm } from "element-plus";
import { getMyWallet, sandboxRecharge  } from "../api/wallet";

// 定义钱包数据类型
interface WalletInfo {
  id: number;
  userId: number;
  balance: string;
  status: number;
  lastTransactionTime: string;
}

const showRechargeDialog = ref(false);
const rechargeLoading = ref(false);
const rechargeFormRef = ref<InstanceType<typeof ElForm>>();
const rechargeForm = ref({
  amount: "",
});

// 添加钱包相关响应式变量
const walletInfo = ref<WalletInfo>({
  id: 0,
  userId: 0,
  balance: "0.00",
  status: 1,
  lastTransactionTime: "",
});
const loading = ref(false);

const rechargeRules = {
  amount: [
    { required: true, message: "请输入充值金额", trigger: "blur" },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && parseFloat(value) <= 0) {
          callback(new Error("充值金额必须大于0"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

const fetchWallet = async () => {
  loading.value = true;
  try {
    const response = await getMyWallet();
    const data = response.data.data || response.data;
    walletInfo.value = data;
    console.log("获取钱包信息成功:", data);
  } catch (error) {
    ElMessage.error("获取钱包信息失败");
    console.error("获取钱包信息失败:", error);
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return "-";
  return new Date(dateTime).toLocaleString("zh-CN");
};

const handleRecharge = async () => {
  if (!rechargeFormRef.value) return;

  await rechargeFormRef.value.validate(async (valid) => {
    if (valid) {
      rechargeLoading.value = true;
      try {
        // 调用充值API
        await sandboxRecharge({ amount: rechargeForm.value.amount });
        ElMessage.success("充值成功");
        showRechargeDialog.value = false;
        rechargeForm.value.amount = "";
        fetchWallet(); // 重新获取钱包信息
      } catch (error) {
        ElMessage.error("充值失败");
      } finally {
        rechargeLoading.value = false;
      }
    }
  });
};

// 页面加载时获取钱包信息
onMounted(() => {
  fetchWallet();
});
</script>
<style scoped>
.wallet-container {
  padding: 20px;
}

.wallet-card {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.wallet-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.balance-section {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.balance-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
}

.balance-amount {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.last-transaction {
  font-size: 14px;
  color: #999;
}

.wallet-actions {
  text-align: center;
}

.wallet-actions .el-button {
  margin: 0 10px;
}

.dialog-footer {
  text-align: right;
}
</style>
