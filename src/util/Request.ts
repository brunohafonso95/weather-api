import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export type RequestConfig = AxiosRequestConfig;

export type Response<T = any> = AxiosResponse<T>;

export default class Request {
  constructor(private request = axios) {}

  public async get<T>(
    url: string,
    config: RequestConfig = {},
  ): Promise<Response<T>> {
    return this.request.get<T, Response<T>>(url, config);
  }

  public static isRequestError(error: AxiosError): boolean {
    return !!(error.response && error.response.status);
  }
}
