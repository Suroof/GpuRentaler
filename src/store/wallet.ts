import { defineStore } from 'pinia';
import { getMyWallet, sandboxRecharge } from '../api/wallet';

interface WalletState {
  id: number | null;
  userId: number | null;
  balance: string;
  status: number | null;
  lastTransactionTime: string | null;
  loading: boolean;
}

export const useWalletStore = defineStore('wallet', {
  state: (): WalletState => ({
    id: null,
    userId: null,
    balance: '0.00',
    status: null,
    lastTransactionTime: null,
    loading: false
  }),

  actions: {
    // 获取钱包信息
    async fetchWalletInfo() {
      this.loading = true;
      try {
        const response = await getMyWallet();
        const data = response.data.data;
        this.id = data.id;
        this.userId = data.userId;
        this.balance = data.balance;
        this.status = data.status;
        this.lastTransactionTime = data.lastTransactionTime;
      } catch (error) {
        console.error('获取钱包信息失败:', error);
      } finally {
        this.loading = false;
      }
    },

    // 沙箱充值
    async recharge(amount: string) {
      try {
        const response = await sandboxRecharge({ amount });
        // 充值成功后重新获取钱包信息
        await this.fetchWalletInfo();
        return response;
      } catch (error) {
        console.error('充值失败:', error);
        throw error;
      }
    }
  }
});
