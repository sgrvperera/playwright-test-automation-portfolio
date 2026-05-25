import dotenv from 'dotenv';

dotenv.config();

export interface EnvironmentConfig {
  baseUrl: string;
  apiBaseUrl: string;
  adminEmail: string;
  adminPassword: string;
  userEmail: string;
  userPassword: string;
  headless: boolean;
  timeout: number;
  logLevel: string;
}

class ConfigManager {
  private config: EnvironmentConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
      apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000/api',
      adminEmail: process.env.ADMIN_EMAIL || 'admin@projecthub.com',
      adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
      userEmail: process.env.USER_EMAIL || 'user@projecthub.com',
      userPassword: process.env.USER_PASSWORD || 'User@123',
      headless: process.env.HEADLESS !== 'false',
      timeout: parseInt(process.env.TIMEOUT || '30000', 10),
      logLevel: process.env.LOG_LEVEL || 'info',
    };
  }

  get(): EnvironmentConfig {
    return this.config;
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  getApiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  getAdminCredentials(): { email: string; password: string } {
    return {
      email: this.config.adminEmail,
      password: this.config.adminPassword,
    };
  }

  getUserCredentials(): { email: string; password: string } {
    return {
      email: this.config.userEmail,
      password: this.config.userPassword,
    };
  }
}

export const config = new ConfigManager();
