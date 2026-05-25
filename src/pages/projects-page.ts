import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';
import { Project } from '../services/project-service';

export class ProjectsPage extends BasePage {
  private readonly searchInput: Locator;
  private readonly statusFilter: Locator;
  private readonly priorityFilter: Locator;
  private readonly filterButton: Locator;
  private readonly createProjectButton: Locator;
  private readonly projectsTableBody: Locator;
  private readonly projectModal: Locator;
  private readonly modalTitle: Locator;
  private readonly projectNameInput: Locator;
  private readonly projectStatusInput: Locator;
  private readonly projectPriorityInput: Locator;
  private readonly projectDescriptionInput: Locator;
  private readonly saveProjectButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.getByTestId('search-input');
    this.statusFilter = page.getByTestId('status-filter');
    this.priorityFilter = page.getByTestId('priority-filter');
    this.filterButton = page.getByTestId('filter-button');
    this.createProjectButton = page.getByTestId('create-project-button');
    this.projectsTableBody = page.getByTestId('projects-table-body');
    this.projectModal = page.getByTestId('project-modal');
    this.modalTitle = page.getByTestId('modal-title');
    this.projectNameInput = page.getByTestId('project-name-input');
    this.projectStatusInput = page.getByTestId('project-status-input');
    this.projectPriorityInput = page.getByTestId('project-priority-input');
    this.projectDescriptionInput = page.getByTestId('project-description-input');
    this.saveProjectButton = page.getByTestId('save-project-button');
    this.cancelButton = page.getByTestId('cancel-button');
  }

  async searchProjects(searchTerm: string): Promise<void> {
    await this.fill(this.searchInput, searchTerm, `Searching for: ${searchTerm}`);
    await this.click(this.filterButton, 'Applying search filter');
  }

  async filterByStatus(status: string): Promise<void> {
    await this.selectOption(this.statusFilter, status, `Filtering by status: ${status}`);
    await this.click(this.filterButton, 'Applying status filter');
  }

  async filterByPriority(priority: string): Promise<void> {
    await this.selectOption(this.priorityFilter, priority, `Filtering by priority: ${priority}`);
    await this.click(this.filterButton, 'Applying priority filter');
  }

  async openCreateProjectModal(): Promise<void> {
    await this.click(this.createProjectButton, 'Opening create project modal');
    await this.projectModal.waitFor({ state: 'visible' });
  }

  async createProject(project: Project): Promise<void> {
    await this.openCreateProjectModal();
    await this.fill(this.projectNameInput, project.name);
    await this.selectOption(this.projectStatusInput, project.status);
    await this.selectOption(this.projectPriorityInput, project.priority);
    if (project.description) {
      await this.fill(this.projectDescriptionInput, project.description);
    }
    await this.click(this.saveProjectButton, 'Saving project');
    await this.projectModal.waitFor({ state: 'hidden' });
  }

  async editProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const editButton = this.page.getByTestId(`edit-${projectId}`);
    await this.click(editButton, `Editing project ${projectId}`);
    await this.projectModal.waitFor({ state: 'visible' });

    if (updates.name) await this.fill(this.projectNameInput, updates.name);
    if (updates.status) await this.selectOption(this.projectStatusInput, updates.status);
    if (updates.priority) await this.selectOption(this.projectPriorityInput, updates.priority);
    if (updates.description) await this.fill(this.projectDescriptionInput, updates.description);

    await this.click(this.saveProjectButton, 'Saving project changes');
    await this.projectModal.waitFor({ state: 'hidden' });
  }

  async deleteProject(projectId: string): Promise<void> {
    const deleteButton = this.page.getByTestId(`delete-${projectId}`);
    
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.click(deleteButton, `Deleting project ${projectId}`);
  }

  async getProjectRowCount(): Promise<number> {
    return this.projectsTableBody.locator('tr').count();
  }

  async isProjectVisible(projectName: string): Promise<boolean> {
    const row = this.projectsTableBody.locator('tr', { hasText: projectName }).first();
    return row.isVisible();
  }

  async getModalTitle(): Promise<string> {
    return this.getText(this.modalTitle);
  }

  async closeModal(): Promise<void> {
    await this.click(this.cancelButton, 'Closing modal');
    await this.projectModal.waitFor({ state: 'hidden' });
  }
}
