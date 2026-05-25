import { test, expect } from '../../src/fixtures/test-fixtures';
import { ProjectFactory } from '../../src/data/project-factory';

test.describe('Cross-Layer Integration @regression', () => {
  test.use({ storageState: 'auth-state.json' });

  test('should sync project creation between API and UI', async ({ 
    authenticatedPage, 
    projectService, 
    projectsPage, 
    page 
  }) => {
    const project = ProjectFactory.createActive({ name: `API-UI-Sync-${Date.now()}` });
    
    const apiResponse = await projectService.createProject(project);
    expect(apiResponse.success).toBe(true);
    
    await page.goto('/projects');
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(true);
  });

  test('should reflect UI changes in API responses', async ({ 
    authenticatedPage, 
    projectService, 
    projectsPage, 
    page 
  }) => {
    await page.goto('/projects');
    
    const project = ProjectFactory.create({ name: `UI-API-Sync-${Date.now()}` });
    await projectsPage.createProject(project);
    
    const apiResponse = await projectService.getProjects({ search: project.name });
    expect(apiResponse.data.length).toBeGreaterThan(0);
    expect(apiResponse.data[0].name).toBe(project.name);
  });

  test('should maintain data consistency during concurrent operations', async ({ 
    authenticatedPage, 
    projectService, 
    projectsPage, 
    page 
  }) => {
    const project = ProjectFactory.create({ name: `Concurrent-${Date.now()}` });
    const created = await projectService.createProject(project);
    
    await page.goto('/projects');
    await page.reload();
    
    const updates = { status: 'completed' as const };
    await projectService.updateProject(created.data.id!, updates);
    
    await page.reload();
    await projectsPage.filterByStatus('completed');
    
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(true);
  });

  test('should validate dashboard stats match API data', async ({ 
    authenticatedPage, 
    dashboardPage, 
    projectService, 
    page 
  }) => {
    await page.goto('/dashboard');
    
    const uiTotalProjects = await dashboardPage.getTotalProjects();
    
    const apiResponse = await projectService.getProjects();
    const apiTotalProjects = apiResponse.total;
    
    expect(uiTotalProjects).toBe(apiTotalProjects);
  });

  test('should handle API-created project deletion in UI', async ({ 
    authenticatedPage, 
    projectService, 
    projectsPage, 
    page 
  }) => {
    const project = ProjectFactory.create({ name: `Delete-Test-${Date.now()}` });
    const created = await projectService.createProject(project);
    
    await page.goto('/projects');
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(true);
    
    await projectService.deleteProject(created.data.id!);
    await page.reload();
    
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(false);
  });
});

test.describe('End-to-End Workflows @smoke', () => {
  test.use({ storageState: 'auth-state.json' });

  test('complete project lifecycle: create, update, verify, delete', async ({ 
    authenticatedPage, 
    projectService, 
    projectsPage, 
    page 
  }) => {
    const projectName = `E2E-Lifecycle-${Date.now()}`;
    
    await page.goto('/projects');
    const project = ProjectFactory.create({ 
      name: projectName, 
      status: 'planning',
      priority: 'low' 
    });
    await projectsPage.createProject(project);
    
    await expect(projectsPage.isProjectVisible(projectName)).resolves.toBe(true);
    
    const apiProjects = await projectService.getProjects({ search: projectName });
    expect(apiProjects.data.length).toBe(1);
    const createdProject = apiProjects.data[0];
    
    const updates = { status: 'active' as const, priority: 'high' as const };
    await projectsPage.editProject(createdProject.id!, updates);
    
    const updatedApi = await projectService.getProjectById(createdProject.id!);
    expect(updatedApi.data.status).toBe('active');
    expect(updatedApi.data.priority).toBe('high');
    
    await projectsPage.deleteProject(createdProject.id!);
    await expect(projectsPage.isProjectVisible(projectName)).resolves.toBe(false);
  });

  test('user journey: login, view dashboard, manage projects, logout', async ({ 
    page, 
    loginPage, 
    dashboardPage, 
    projectsPage 
  }) => {
    await loginPage.goto();
    await loginPage.loginAsAdmin();
    
    await expect(dashboardPage.isDashboardVisible()).resolves.toBe(true);
    const totalProjects = await dashboardPage.getTotalProjects();
    expect(totalProjects).toBeGreaterThanOrEqual(0);
    
    await dashboardPage.navigateToProjects();
    await expect(page).toHaveURL(/projects/);
    
    const project = ProjectFactory.createActive({ name: `Journey-${Date.now()}` });
    await projectsPage.createProject(project);
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(true);
    
    await page.goto('/dashboard');
    await dashboardPage.logout();
    
    await expect(loginPage.isLoginFormVisible()).resolves.toBe(true);
  });
});
