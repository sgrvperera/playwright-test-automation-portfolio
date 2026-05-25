import { Page, Locator } from '@playwright/test';

export class NavigationComponent {
  private readonly page: Page;
  private readonly userName: Locator;
  private readonly logoutButton: Locator;
  private readonly navDashboard: Locator;
  private readonly navProjects: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProjects = page.getByTestId('nav-projects');
  }

  async getUserName(): Promise<string> {
    return (await this.userName.textContent()) || '';
  }

  async navigateToDashboard(): Promise<void> {
    await this.navDashboard.click();
    await this.page.waitForURL(/dashboard/);
  }

  async navigateToProjects(): Promise<void> {
    await this.navProjects.click();
    await this.page.waitForURL(/projects/);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
    await this.page.waitForURL(/\//);
  }

  async isVisible(): Promise<boolean> {
    return this.userName.isVisible();
  }
}
