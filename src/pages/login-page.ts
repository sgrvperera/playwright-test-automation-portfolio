import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { config } from '../config/environment';

export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-button');
    this.errorMessage = page.getByTestId('error-message');
    this.loginForm = page.getByTestId('login-form');
  }

  async goto(): Promise<void> {
    await this.navigate(config.getBaseUrl());
  }

  async login(email: string, password: string): Promise<void> {
    await this.fill(this.emailInput, email, `Entering email: ${email}`);
    await this.fill(this.passwordInput, password, 'Entering password');
    await this.click(this.loginButton, 'Clicking login button');
    await this.page.waitForLoadState('networkidle');
  }

  async loginAsAdmin(): Promise<void> {
    const credentials = config.getAdminCredentials();
    await this.login(credentials.email, credentials.password);
    await this.waitForUrl(/dashboard/);
  }

  async loginAsUser(): Promise<void> {
    const credentials = config.getUserCredentials();
    await this.login(credentials.email, credentials.password);
    await this.waitForUrl(/dashboard/);
  }

  async getErrorMessage(): Promise<string> {
    return this.getText(this.errorMessage);
  }

  async isErrorVisible(): Promise<boolean> {
    try {
      await this.errorMessage.waitFor({ state: 'visible', timeout: 3000 });
      return this.isVisible(this.errorMessage);
    } catch {
      return false;
    }
  }

  async isLoginFormVisible(): Promise<boolean> {
    return this.isVisible(this.loginForm);
  }
}
