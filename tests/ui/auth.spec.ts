import { test, expect } from '../../src/fixtures/test-fixtures';
import { config } from '../../src/config/environment';

test.describe('Authentication @smoke', () => {
  test('should login successfully with valid admin credentials', async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    
    const credentials = config.getAdminCredentials();
    await loginPage.login(credentials.email, credentials.password);
    
    await expect(dashboardPage.isDashboardVisible()).resolves.toBe(true);
    await expect(dashboardPage.getUserName()).resolves.toContain('Admin');
  });

  test('should login successfully with valid user credentials', async ({ loginPage, dashboardPage }) => {
    await loginPage.goto();
    
    const credentials = config.getUserCredentials();
    await loginPage.login(credentials.email, credentials.password);
    
    await expect(dashboardPage.isDashboardVisible()).resolves.toBe(true);
    await expect(dashboardPage.getUserName()).resolves.toContain('User');
  });

  test('should show error message with invalid credentials', async ({ loginPage }) => {
    await loginPage.goto();
    
    await loginPage.login('invalid@test.com', 'wrongpassword');
    
    await expect(loginPage.isErrorVisible()).resolves.toBe(true);
    await expect(loginPage.getErrorMessage()).resolves.toContain('Invalid credentials');
  });

  test('should logout successfully', async ({ authenticatedPage, dashboardPage, loginPage }) => {
    await dashboardPage.logout();
    
    await expect(loginPage.isLoginFormVisible()).resolves.toBe(true);
  });
});

test.describe('Authentication - Negative Cases @regression', () => {
  test('should reject empty email', async ({ loginPage, page }) => {
    await loginPage.goto();
    
    await page.getByTestId('password-input').fill('password123');
    await page.getByTestId('login-button').click();
    
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should reject empty password', async ({ loginPage, page }) => {
    await loginPage.goto();
    
    await page.getByTestId('email-input').fill('test@test.com');
    await page.getByTestId('login-button').click();
    
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toHaveAttribute('required', '');
  });

  test('should reject invalid email format', async ({ loginPage, page }) => {
    await loginPage.goto();
    
    await page.getByTestId('email-input').fill('notanemail');
    await page.getByTestId('password-input').fill('password123');
    
    const emailInput = page.getByTestId('email-input');
    await expect(emailInput).toHaveAttribute('type', 'email');
  });
});
