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
          <div class="balance-amount">¥ {{ walletStore.balance }}</div>
          <div class="last-transaction" v-if="walletStore.lastTransactionTime">
            最后交易时间: {{ formatDateTime(walletStore.lastTransactionTime) }}
          </div>
        </div>

        <div class="wallet-status">
          <el-tag :type="walletStore.status === 1 ? 'success' : 'warning'">
            {{ walletStore.status === 1 ? '正常' : '异常' }}
          </el-tag>
        </div>
      </div>

      <div class="wallet-actions">
        <el-button type="primary" @click="showRechargeDialog = true">
          充值
        </el-button>
        <el-button @click="walletStore.fetchWalletInfo">
          刷新
        </el-button>
      </div>
    </el-card>

    <!-- 充值对话框 -->
    <el-dialog
      v-model="showRechargeDialog"
      title="账户充值"
      width="400px"
    >
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
import { ref, onMounted } from 'vue';
import { ElMessage, ElForm } from 'element-plus';
import { useWalletStore } from '../store/wallet';

const walletStore = useWalletStore();
const showRechargeDialog = ref(false);
const rechargeLoading = ref(false);
const rechargeFormRef = ref<InstanceType<typeof ElForm>>();
const rechargeForm = ref({
  amount: ''
});

const rechargeRules = {
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value && parseFloat(value) <= 0) {
          callback(new Error('充值金额必须大于0'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 格式化日期时间
const formatDateTime = (dateTime: string) => {
  return new Date(dateTime).toLocaleString('zh-CN');
};

// 处理充值
const handleRecharge = async () => {
  if (!rechargeFormRef.value) return;

  await rechargeFormRef.value.validate(async (valid) => {
    if (valid) {
      rechargeLoading.value = true;
      try {
        await walletStore.recharge(rechargeForm.value.amount);
        ElMessage.success('充值成功');
        showRechargeDialog.value = false;
        rechargeForm.value.amount = '';
      } catch (error) {
        ElMessage.error('充值失败');
      } finally {
        rechargeLoading.value = false;
      }
    }
  });
};

// 页面加载时获取钱包信息
onMounted(() => {
  walletStore.fetchWalletInfo();
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
