import { APIRequestContext, APIResponse } from '@playwright/test';
import { TestLogger } from '../utils/logger';

export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
}

export class ApiClient {
  private request: APIRequestContext;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(request: APIRequestContext, config: ApiClientConfig) {
    this.request = request;
    this.baseURL = config.baseURL;
    this.defaultHeaders = config.headers || {};
  }

  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  removeAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  private getHeaders(additionalHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...additionalHeaders,
    };
  }

  async get(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    TestLogger.apiRequest('GET', url);

    const response = await this.request.get(url, {
      headers: this.getHeaders(headers),
    });

    TestLogger.apiResponse(response.status());
    return response;
  }

  async post(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    TestLogger.apiRequest('POST', url, data);

    const response = await this.request.post(url, {
      headers: this.getHeaders(headers),
      data,
    });

    TestLogger.apiResponse(response.status());
    return response;
  }

  async put(
    endpoint: string,
    data?: unknown,
    headers?: Record<string, string>
  ): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    TestLogger.apiRequest('PUT', url, data);

    const response = await this.request.put(url, {
      headers: this.getHeaders(headers),
      data,
    });

    TestLogger.apiResponse(response.status());
    return response;
  }

  async delete(endpoint: string, headers?: Record<string, string>): Promise<APIResponse> {
    const url = `${this.baseURL}${endpoint}`;
    TestLogger.apiRequest('DELETE', url);

    const response = await this.request.delete(url, {
      headers: this.getHeaders(headers),
    });

    TestLogger.apiResponse(response.status());
    return response;
  }

  async validateResponse(
    response: APIResponse,
    expectedStatus: number
  ): Promise<Record<string, unknown>> {
    const status = response.status();
    if (status !== expectedStatus) {
      const body = await response.text();
      throw new Error(
        `Expected status ${expectedStatus} but got ${status}. Response: ${body}`
      );
    }
    return response.json();
  }
}
