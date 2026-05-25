import { ApiClient } from './api-client';
import { TestLogger } from '../utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}

export class AuthService {
  private apiClient: ApiClient;
  private currentToken: string | null = null;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    TestLogger.step(`Logging in as ${credentials.email}`);

    const response = await this.apiClient.post('/auth/login', credentials);
    const data = await this.apiClient.validateResponse(response, 200);

    if (data.success && data.token) {
      this.currentToken = data.token as string;
      this.apiClient.setAuthToken(data.token as string);
      TestLogger.info(`Login successful for ${credentials.email}`);
    }

    return data as unknown as AuthResponse;
  }

  async logout(): Promise<void> {
    TestLogger.step('Logging out');

    if (this.currentToken) {
      await this.apiClient.post('/auth/logout');
      this.apiClient.removeAuthToken();
      this.currentToken = null;
      TestLogger.info('Logout successful');
    }
  }

  getToken(): string | null {
    return this.currentToken;
  }

  isAuthenticated(): boolean {
    return this.currentToken !== null;
  }
}
