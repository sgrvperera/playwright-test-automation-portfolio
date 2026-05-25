import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Dashboard @smoke', () => {
  test.use({ storageState: 'auth-state.json' });

  test('should display dashboard with stats', async ({ authenticatedPage, dashboardPage }) => {
    await expect(dashboardPage.isDashboardVisible()).resolves.toBe(true);
    await expect(dashboardPage.getWelcomeTitle()).resolves.toContain('Welcome to ProjectHub');
  });

  test('should display correct user name', async ({ authenticatedPage, dashboardPage }) => {
    const userName = await dashboardPage.getUserName();
    expect(userName).toBeTruthy();
    expect(userName.length).toBeGreaterThan(0);
  });

  test('should display project statistics', async ({ authenticatedPage, dashboardPage }) => {
    const totalProjects = await dashboardPage.getTotalProjects();
    const activeProjects = await dashboardPage.getActiveProjects();
    
    expect(totalProjects).toBeGreaterThanOrEqual(0);
    expect(activeProjects).toBeGreaterThanOrEqual(0);
    expect(activeProjects).toBeLessThanOrEqual(totalProjects);
  });

  test('should display task statistics', async ({ authenticatedPage, dashboardPage }) => {
    const totalTasks = await dashboardPage.getTotalTasks();
    const completedTasks = await dashboardPage.getCompletedTasks();
    
    expect(totalTasks).toBeGreaterThanOrEqual(0);
    expect(completedTasks).toBeGreaterThanOrEqual(0);
    expect(completedTasks).toBeLessThanOrEqual(totalTasks);
  });

  test('should navigate to projects page', async ({ authenticatedPage, dashboardPage, page }) => {
    await dashboardPage.navigateToProjects();
    
    await expect(page).toHaveURL(/projects/);
  });
});

test.describe('Dashboard - Navigation @regression', () => {
  test.use({ storageState: 'auth-state.json' });

  test('should navigate between dashboard and projects', async ({ 
    authenticatedPage, 
    dashboardPage, 
    navigation, 
    page 
  }) => {
    await dashboardPage.navigateToProjects();
    await expect(page).toHaveURL(/projects/);
    
    await navigation.navigateToDashboard();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should maintain user session across navigation', async ({ 
    authenticatedPage, 
    dashboardPage, 
    navigation 
  }) => {
    const userNameBefore = await navigation.getUserName();
    
    await dashboardPage.navigateToProjects();
    await navigation.navigateToDashboard();
    
    const userNameAfter = await navigation.getUserName();
    expect(userNameAfter).toBe(userNameBefore);
  });
});
