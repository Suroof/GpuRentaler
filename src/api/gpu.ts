import request from '../utils/request';
import {BASE_URI} from './base';

// 查询GPU设备列表
export function getGpuDeviceList(params: any) {
    return request({
        url: `${BASE_URI}/gpu/devices`,
        method: 'get',
        params
    });
}

// 查询可租用GPU设备
export function getRentableGpuDevices(params: any) {
    return request({
        url: `${BASE_URI}/gpu/rentable-devices`,
        method: 'get',
        params
    });
}

// 租用GPU设备
export function leaseGpuDevice(deviceId: string, file?: File, data?: any) {
  // 如果有文件，使用 FormData 格式
  if (file) {
      const formData = new FormData();
      formData.append('file', file);

      // 如果有其他数据，也添加到 FormData 中
      if (data) {
          Object.keys(data).forEach(key => {
              formData.append(key, data[key]);
          });
      }

      return request({
          url: `${BASE_URI}/gpu/${deviceId}/lease`,
          method: 'post',
          data: formData,
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
  } else {
      // 如果没有文件，使用普通的 JSON 格式
      return request({
          url: `${BASE_URI}/gpu/${deviceId}/lease`,
          method: 'post',
          data
      });
  }
}

// 归还GPU设备
export function returnGpuDevice(deviceId: string) {
    return request({
        url: `${BASE_URI}/gpu/${deviceId}/return`,
        method: 'post'
    });
}

// 更新GPU设备信息
export function updateGpuDevice(deviceId: string, data: any) {
    return request({
        url: `${BASE_URI}/gpu/${deviceId}/devices`,
        method: 'post',
        data
    });
}

// 删除GPU设备
export function deleteGpuDevice(deviceId: string) {
    return request({
        url: `${BASE_URI}/gpu/${deviceId}/release`,
        method: 'delete'
    });
}

// 查询我的租用记录
export function getMyLeaseRecords(data: any) {
    return request({
        url: `${BASE_URI}/gpu/mylease`,
        method: 'post',
        data
    });
}

// 查询所有租用记录（管理员）
export function getAllLeaseRecords(params: any) {
    return request({
        url: `${BASE_URI}/gpu/alllease`,
        method: 'get',
        params
    });
}
