import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { ProjectsPage } from '../pages/projects-page';
import { NavigationComponent } from '../components/navigation';
import { ApiClient } from '../services/api-client';
import { AuthService } from '../services/auth-service';
import { ProjectService } from '../services/project-service';
import { config } from '../config/environment';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  projectsPage: ProjectsPage;
  navigation: NavigationComponent;
};

type ApiFixtures = {
  apiClient: ApiClient;
  authService: AuthService;
  projectService: ProjectService;
  authenticatedProjectService: ProjectService;
};

type AuthFixtures = {
  authenticatedPage: Page;
  authenticatedApiClient: ApiClient;
};

export const test = base.extend<PageFixtures & ApiFixtures & AuthFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },

  navigation: async ({ page }, use) => {
    await use(new NavigationComponent(page));
  },

  apiClient: async ({ request }, use) => {
    const client = new ApiClient(request, {
      baseURL: config.getApiBaseUrl(),
    });
    await use(client);
  },

  authService: async ({ apiClient }, use) => {
    const service = new AuthService(apiClient);
    await use(service);
    await service.logout();
  },

  projectService: async ({ authenticatedApiClient }, use) => {
    await use(new ProjectService(authenticatedApiClient));
  },

  authenticatedProjectService: async ({ authenticatedApiClient }, use) => {
    await use(new ProjectService(authenticatedApiClient));
  },

  authenticatedPage: async ({ page, loginPage }, use) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    await use(page);
  },

  authenticatedApiClient: async ({ request }, use) => {
    const client = new ApiClient(request, {
      baseURL: config.getApiBaseUrl(),
    });

    const authService = new AuthService(client);
    const credentials = config.getAdminCredentials();
    await authService.login(credentials);

    await use(client);
    await authService.logout();
  },
});

export { expect } from '@playwright/test';
