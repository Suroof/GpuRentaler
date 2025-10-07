import request from '../utils/request';
import {BASE_URI} from './base';

export function getDockerList(params: any) {
    return request({
        url: `${BASE_URI}/docker/image/me`,
        method: 'get',
        params
    });
}

export function uploadDocker(data: any) {
  return request({
      url: `${BASE_URI}/docker/image/upload`,
      method: 'post',
      data
  });
}

