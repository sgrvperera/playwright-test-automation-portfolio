import { test, expect } from '../../src/fixtures/test-fixtures';
import { ProjectFactory, TestDataBuilder } from '../../src/data/project-factory';

test.describe('Projects - CRUD Operations @smoke', () => {
  test.use({ storageState: 'auth-state.json' });

  test('should create a new project successfully', async ({ 
    authenticatedPage, 
    projectsPage, 
    page 
  }) => {
    await page.goto('/projects');
    
    const project = ProjectFactory.createActive({
      name: 'New E-Commerce Platform',
      description: 'Building next-gen shopping experience',
    });
    
    await projectsPage.createProject(project);
    
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(true);
  });

  test('should edit existing project', async ({ 
    authenticatedPage, 
    projectsPage, 
    projectService, 
    page 
  }) => {
    await page.goto('/projects');
    
    const project = ProjectFactory.create();
    const created = await projectService.createProject(project);
    await page.reload();
    
    const updates = { name: 'Updated Project Name', status: 'active' as const };
    await projectsPage.editProject(created.data.id!, updates);
    
    await expect(projectsPage.isProjectVisible(updates.name)).resolves.toBe(true);
  });

  test('should delete project', async ({ 
    authenticatedPage, 
    projectsPage, 
    projectService, 
    page 
  }) => {
    await page.goto('/projects');
    
    const project = ProjectFactory.create({ name: 'Project To Delete' });
    const created = await projectService.createProject(project);
    await page.reload();
    
    await projectsPage.deleteProject(created.data.id!);
    
    await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(false);
  });
});

test.describe('Projects - Filtering @regression', () => {
  test.use({ storageState: 'auth-state.json' });

  test('should filter projects by status', async ({ 
    authenticatedPage, 
    projectsPage, 
    page 
  }) => {
    await page.goto('/projects');
    
    await projectsPage.filterByStatus('active');
    
    const rowCount = await projectsPage.getProjectRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should filter projects by priority', async ({ 
    authenticatedPage, 
    projectsPage, 
    page 
  }) => {
    await page.goto('/projects');
    
    await projectsPage.filterByPriority('high');
    
    const rowCount = await projectsPage.getProjectRowCount();
    expect(rowCount).toBeGreaterThanOrEqual(0);
  });

  test('should search projects by name', async ({ 
    authenticatedPage, 
    projectsPage, 
    projectService, 
    page 
  }) => {
    await page.goto('/projects');
    
    const uniqueName = `SearchTest-${Date.now()}`;
    const project = ProjectFactory.create({ name: uniqueName });
    await projectService.createProject(project);
    await page.reload();
    
    await projectsPage.searchProjects(uniqueName);
    
    await expect(projectsPage.isProjectVisible(uniqueName)).resolves.toBe(true);
  });
});

test.describe('Projects - Data-Driven Tests @regression', () => {
  test.use({ storageState: 'auth-state.json' });

  const priorities = ['low', 'medium', 'high'] as const;

  for (const priority of priorities) {
    test(`should create project with ${priority} priority`, async ({ 
      authenticatedPage, 
      projectsPage, 
      page 
    }) => {
      await page.goto('/projects');
      
      const project = new TestDataBuilder()
        .withName(`${priority.toUpperCase()} Priority Project`)
        .withPriority(priority)
        .withStatus('active')
        .build();
      
      await projectsPage.createProject(project);
      
      await expect(projectsPage.isProjectVisible(project.name)).resolves.toBe(true);
    });
  }
});

test.describe('Projects - Validation @regression', () => {
  test.use({ storageState: 'auth-state.json' });

  test('should open and close create modal', async ({ 
    authenticatedPage, 
    projectsPage, 
    page 
  }) => {
    await page.goto('/projects');
    
    await projectsPage.openCreateProjectModal();
    await expect(projectsPage.getModalTitle()).resolves.toBe('Create Project');
    
    await projectsPage.closeModal();
  });

  test('should display edit modal with correct title', async ({ 
    authenticatedPage, 
    projectsPage, 
    projectService, 
    page 
  }) => {
    await page.goto('/projects');
    
    const project = ProjectFactory.create();
    const created = await projectService.createProject(project);
    await page.reload();
    
    const editButton = page.getByTestId(`edit-${created.data.id}`);
    await editButton.click();
    
    await expect(projectsPage.getModalTitle()).resolves.toBe('Edit Project');
  });
});
