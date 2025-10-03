import request from "../utils/request";
import { BASE_URI } from "./base";

//新增或更新服务器信息
export function addServer(serverId: number, serverData: any) {
  return request({
    url: `${BASE_URI}/${serverId}/modify`,
    method: "post",
    data: serverData
  });
}

export function delServer(serverId: number) {
  return request({
    url: `${BASE_URI}/${serverId}/delete`,
    method: "DELETE",
  });
}

export function getServerList() {
  return request({
    url: `${BASE_URI}/servers`,
    method: "get",
  });
}
