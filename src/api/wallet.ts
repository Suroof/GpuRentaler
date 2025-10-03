import request from '../utils/request';
import {BASE_URI} from './base';

// 查询我的钱包余额
export function getMyWallet() {
    return request({
        url: `${BASE_URI}/wallet/my`,
        method: 'get'
    });
}

// 沙箱充值（测试环境）
export function sandboxRecharge(data: { amount: string }) {
    return request({
        url: `${BASE_URI}/wallet/sandbox/recharge`,
        method: 'post',
        data: data
    });
}
