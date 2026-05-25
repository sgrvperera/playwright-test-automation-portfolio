import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  private readonly appTitle: Locator;
  private readonly userName: Locator;
  private readonly logoutButton: Locator;
  private readonly navDashboard: Locator;
  private readonly navProjects: Locator;
  private readonly statsGrid: Locator;
  private readonly statTotalProjects: Locator;
  private readonly statActiveProjects: Locator;
  private readonly statTotalTasks: Locator;
  private readonly statCompletedTasks: Locator;
  private readonly welcomeTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.appTitle = page.getByTestId('app-title');
    this.userName = page.getByTestId('user-name');
    this.logoutButton = page.getByTestId('logout-button');
    this.navDashboard = page.getByTestId('nav-dashboard');
    this.navProjects = page.getByTestId('nav-projects');
    this.statsGrid = page.getByTestId('stats-grid');
    this.statTotalProjects = page.getByTestId('stat-total-projects');
    this.statActiveProjects = page.getByTestId('stat-active-projects');
    this.statTotalTasks = page.getByTestId('stat-total-tasks');
    this.statCompletedTasks = page.getByTestId('stat-completed-tasks');
    this.welcomeTitle = page.getByTestId('welcome-title');
  }

  async getUserName(): Promise<string> {
    return this.getText(this.userName);
  }

  async getTotalProjects(): Promise<number> {
    const text = await this.getText(this.statTotalProjects);
    return parseInt(text, 10);
  }

  async getActiveProjects(): Promise<number> {
    const text = await this.getText(this.statActiveProjects);
    return parseInt(text, 10);
  }

  async getTotalTasks(): Promise<number> {
    const text = await this.getText(this.statTotalTasks);
    return parseInt(text, 10);
  }

  async getCompletedTasks(): Promise<number> {
    const text = await this.getText(this.statCompletedTasks);
    return parseInt(text, 10);
  }

  async navigateToProjects(): Promise<void> {
    await this.click(this.navProjects, 'Navigating to Projects page');
    await this.waitForUrl(/projects/);
  }

  async logout(): Promise<void> {
    await this.click(this.logoutButton, 'Logging out');
    await this.waitForUrl(/\//);
  }

  async isDashboardVisible(): Promise<boolean> {
    try {
      await this.statsGrid.waitFor({ state: 'visible', timeout: 5000 });
      return this.isVisible(this.statsGrid);
    } catch {
      return false;
    }
  }

  async getWelcomeTitle(): Promise<string> {
    return this.getText(this.welcomeTitle);
  }
}
