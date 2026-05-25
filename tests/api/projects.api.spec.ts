import { test, expect } from '../../src/fixtures/test-fixtures';
import { ProjectFactory } from '../../src/data/project-factory';
import { SchemaValidator, ProjectsResponseSchema } from '../../src/utils/schema-validator';

test.describe('Projects API - CRUD @smoke @api', () => {
  test('should get all projects', async ({ authenticatedApiClient, projectService }) => {
    const response = await projectService.getProjects();
    
    expect(response.success).toBe(true);
    expect(response.data).toBeInstanceOf(Array);
    expect(response.total).toBeGreaterThanOrEqual(0);
  });

  test('should validate projects response schema', async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.get('/projects');
    const data = await response.json();
    
    expect(() => SchemaValidator.validate(data, ProjectsResponseSchema)).not.toThrow();
  });

  test('should create project via API', async ({ projectService }) => {
    const project = ProjectFactory.createActive();
    const response = await projectService.createProject(project);
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBeTruthy();
    expect(response.data.name).toBe(project.name);
    expect(response.data.status).toBe(project.status);
    expect(response.data.priority).toBe(project.priority);
  });

  test('should get project by ID', async ({ projectService }) => {
    const project = ProjectFactory.create();
    const created = await projectService.createProject(project);
    
    const response = await projectService.getProjectById(created.data.id!);
    
    expect(response.success).toBe(true);
    expect(response.data.id).toBe(created.data.id);
    expect(response.data.name).toBe(project.name);
  });

  test('should update project', async ({ projectService }) => {
    const project = ProjectFactory.create();
    const created = await projectService.createProject(project);
    
    const updates = { name: 'Updated Name', status: 'completed' as const };
    const response = await projectService.updateProject(created.data.id!, updates);
    
    expect(response.success).toBe(true);
    expect(response.data.name).toBe(updates.name);
    expect(response.data.status).toBe(updates.status);
  });

  test('should delete project', async ({ projectService }) => {
    const project = ProjectFactory.create();
    const created = await projectService.createProject(project);
    
    await expect(projectService.deleteProject(created.data.id!)).resolves.not.toThrow();
  });
});

test.describe('Projects API - Filtering @regression @api', () => {
  test('should filter projects by status', async ({ projectService }) => {
    const response = await projectService.getProjects({ status: 'active' });
    
    expect(response.success).toBe(true);
    response.data.forEach((project) => {
      expect(project.status).toBe('active');
    });
  });

  test('should filter projects by priority', async ({ projectService }) => {
    const response = await projectService.getProjects({ priority: 'high' });
    
    expect(response.success).toBe(true);
    response.data.forEach((project) => {
      expect(project.priority).toBe('high');
    });
  });

  test('should search projects by name', async ({ projectService }) => {
    const uniqueName = `SearchAPI-${Date.now()}`;
    const project = ProjectFactory.create({ name: uniqueName });
    await projectService.createProject(project);
    
    const response = await projectService.getProjects({ search: uniqueName });
    
    expect(response.success).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
    expect(response.data[0].name).toContain(uniqueName);
  });

  test('should combine multiple filters', async ({ projectService }) => {
    const response = await projectService.getProjects({
      status: 'active',
      priority: 'high',
    });
    
    expect(response.success).toBe(true);
    response.data.forEach((project) => {
      expect(project.status).toBe('active');
      expect(project.priority).toBe('high');
    });
  });
});

test.describe('Projects API - Validation @regression @api', () => {
  test('should reject project creation without required fields', async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.post('/projects', {
      name: 'Test Project',
    });
    
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('Missing required fields');
  });

  test('should reject project creation with empty name', async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.post('/projects', {
      name: '',
      status: 'active',
      priority: 'medium',
    });
    
    expect(response.status()).toBe(400);
  });

  test('should return 404 for non-existent project', async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.get('/projects/non-existent-id');
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.message).toContain('not found');
  });

  test('should return 404 when updating non-existent project', async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.put('/projects/non-existent-id', {
      name: 'Updated Name',
    });
    
    expect(response.status()).toBe(404);
  });

  test('should return 404 when deleting non-existent project', async ({ authenticatedApiClient }) => {
    const response = await authenticatedApiClient.delete('/projects/non-existent-id');
    
    expect(response.status()).toBe(404);
  });
});

test.describe('Projects API - Data Integrity @regression @api', () => {
  test('should maintain data consistency after multiple operations', async ({ projectService }) => {
    const project = ProjectFactory.create({ name: 'Consistency Test' });
    const created = await projectService.createProject(project);
    
    const fetched = await projectService.getProjectById(created.data.id!);
    expect(fetched.data.name).toBe(project.name);
    
    const updates = { name: 'Updated Consistency Test' };
    await projectService.updateProject(created.data.id!, updates);
    
    const updated = await projectService.getProjectById(created.data.id!);
    expect(updated.data.name).toBe(updates.name);
    expect(updated.data.id).toBe(created.data.id);
  });

  test('should preserve all project fields during update', async ({ projectService }) => {
    const project = ProjectFactory.create({
      name: 'Full Project',
      description: 'Complete description',
      status: 'planning',
      priority: 'low',
    });
    const created = await projectService.createProject(project);
    
    const updates = { status: 'active' as const };
    const updated = await projectService.updateProject(created.data.id!, updates);
    
    expect(updated.data.name).toBe(project.name);
    expect(updated.data.description).toBe(project.description);
    expect(updated.data.priority).toBe(project.priority);
    expect(updated.data.status).toBe(updates.status);
  });
});
