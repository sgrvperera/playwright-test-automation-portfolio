import { test, expect } from '../../src/fixtures/test-fixtures';
import { config } from '../../src/config/environment';
import { SchemaValidator, AuthResponseSchema } from '../../src/utils/schema-validator';

test.describe('Auth API @smoke @api', () => {
  test('should login with valid credentials and return token', async ({ authService }) => {
    const credentials = config.getAdminCredentials();
    const response = await authService.login(credentials);
    
    expect(response.success).toBe(true);
    expect(response.token).toBeTruthy();
    expect(response.user).toBeDefined();
    expect(response.user?.email).toBe(credentials.email);
    expect(response.user?.role).toBe('admin');
  });

  test('should validate auth response schema', async ({ apiClient }) => {
    const credentials = config.getAdminCredentials();
    const response = await apiClient.post('/auth/login', credentials);
    const data = await response.json();
    
    expect(() => SchemaValidator.validate(data, AuthResponseSchema)).not.toThrow();
  });

  test('should reject invalid credentials', async ({ apiClient }) => {
    const response = await apiClient.post('/auth/login', {
      email: 'invalid@test.com',
      password: 'wrongpassword',
    });
    
    expect(response.status()).toBe(401);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Invalid credentials');
  });

  test('should logout successfully', async ({ authService }) => {
    const credentials = config.getAdminCredentials();
    await authService.login(credentials);
    
    await expect(authService.logout()).resolves.not.toThrow();
    expect(authService.isAuthenticated()).toBe(false);
  });
});

test.describe('Auth API - Negative Cases @regression @api', () => {
  test('should reject login with missing email', async ({ apiClient }) => {
    const response = await apiClient.post('/auth/login', {
      password: 'password123',
    });
    
    expect(response.status()).toBe(401);
  });

  test('should reject login with missing password', async ({ apiClient }) => {
    const response = await apiClient.post('/auth/login', {
      email: 'test@test.com',
    });
    
    expect(response.status()).toBe(401);
  });

  test('should reject login with empty credentials', async ({ apiClient }) => {
    const response = await apiClient.post('/auth/login', {
      email: '',
      password: '',
    });
    
    expect(response.status()).toBe(401);
  });
});

test.describe('Auth API - Security @regression @api', () => {
  test('should not expose sensitive information in error messages', async ({ apiClient }) => {
    const response = await apiClient.post('/auth/login', {
      email: 'test@test.com',
      password: 'wrongpassword',
    });
    
    const data = await response.json();
    expect(data.message).not.toContain('password');
    expect(data.message).not.toContain('hash');
    expect(data.message).not.toContain('database');
  });

  test('should require authentication for protected endpoints', async ({ apiClient }) => {
    const response = await apiClient.get('/projects');
    
    expect(response.status()).toBe(401);
  });
});
