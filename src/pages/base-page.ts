import { Page, Locator } from '@playwright/test';
import { TestLogger } from '../utils/logger';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async navigate(path: string): Promise<void> {
    TestLogger.step(`Navigating to ${path}`);
    await this.page.goto(path);
  }

  protected async click(locator: Locator, description?: string): Promise<void> {
    TestLogger.step(description || 'Clicking element');
    await locator.click();
  }

  protected async fill(locator: Locator, value: string, description?: string): Promise<void> {
    TestLogger.step(description || `Filling input with: ${value}`);
    await locator.fill(value);
  }

  protected async selectOption(
    locator: Locator,
    value: string,
    description?: string
  ): Promise<void> {
    TestLogger.step(description || `Selecting option: ${value}`);
    await locator.selectOption(value);
  }

  protected async getText(locator: Locator): Promise<string> {
    const text = await locator.textContent();
    return text || '';
  }

  protected async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  protected async waitForUrl(url: string | RegExp): Promise<void> {
    await this.page.waitForURL(url);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }
}
