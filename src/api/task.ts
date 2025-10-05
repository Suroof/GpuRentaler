import request from "../utils/request";
import { BASE_URI } from "./base";

export function getTaskList(params: any) {
  return request({
    url: `${BASE_URI}/task/me`,
    method: "get",
    params,
  });
}

export function getAllTaskList(params: any) {
  return request({
    url: `${BASE_URI}/task/all`,
    method: "get",
    params,
  });
}
export function getTaskLog(params: any) {
  return request({
    url: `${BASE_URI}/task/log`,
    method: "get",
    params,
  });
}

export function finishTask(params: any) {
  return request({
    url: `${BASE_URI}/task/finish`,
    method: "post",
    params,
  });
}

export function exportTask(params: any) {
  return request({
    url: `${BASE_URI}/task/data/export`,
    method: "post",
    params,
  });
}
