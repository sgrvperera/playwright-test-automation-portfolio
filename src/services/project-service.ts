import { ApiClient } from './api-client';
import { TestLogger } from '../utils/logger';

export interface Project {
  id?: string;
  name: string;
  status: 'planning' | 'active' | 'completed';
  priority: 'low' | 'medium' | 'high';
  description?: string;
  owner?: string;
  createdAt?: string;
}

export interface ProjectsResponse {
  success: boolean;
  data: Project[];
  total: number;
}

export interface ProjectResponse {
  success: boolean;
  data: Project;
}

export class ProjectService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async getProjects(filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<ProjectsResponse> {
    TestLogger.step('Fetching projects');

    const params = new URLSearchParams(filters as Record<string, string>);
    const endpoint = `/projects${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await this.apiClient.get(endpoint);
    const data = await this.apiClient.validateResponse(response, 200);
    return data as unknown as ProjectsResponse;
  }

  async getProjectById(id: string): Promise<ProjectResponse> {
    TestLogger.step(`Fetching project ${id}`);

    const response = await this.apiClient.get(`/projects/${id}`);
    const data = await this.apiClient.validateResponse(response, 200);
    return data as unknown as ProjectResponse;
  }

  async createProject(project: Project): Promise<ProjectResponse> {
    TestLogger.step(`Creating project: ${project.name}`);

    const response = await this.apiClient.post('/projects', project);
    const data = await this.apiClient.validateResponse(response, 201);
    return data as unknown as ProjectResponse;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<ProjectResponse> {
    TestLogger.step(`Updating project ${id}`);

    const response = await this.apiClient.put(`/projects/${id}`, updates);
    const data = await this.apiClient.validateResponse(response, 200);
    return data as unknown as ProjectResponse;
  }

  async deleteProject(id: string): Promise<void> {
    TestLogger.step(`Deleting project ${id}`);

    const response = await this.apiClient.delete(`/projects/${id}`);
    await this.apiClient.validateResponse(response, 200);
  }
}
