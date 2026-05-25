import { v4 as uuidv4 } from 'uuid';
import { Project } from '../services/project-service';

export class ProjectFactory {
  static create(overrides?: Partial<Project>): Project {
    const uniqueId = uuidv4().substring(0, 8);

    return {
      name: `Test Project ${uniqueId}`,
      status: 'planning',
      priority: 'medium',
      description: `Automated test project created at ${new Date().toISOString()}`,
      ...overrides,
    };
  }

  static createActive(overrides?: Partial<Project>): Project {
    return this.create({
      status: 'active',
      priority: 'high',
      ...overrides,
    });
  }

  static createCompleted(overrides?: Partial<Project>): Project {
    return this.create({
      status: 'completed',
      priority: 'low',
      ...overrides,
    });
  }

  static createBatch(count: number, overrides?: Partial<Project>): Project[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createWithAllPriorities(): Project[] {
    return [
      this.create({ priority: 'low', name: 'Low Priority Project' }),
      this.create({ priority: 'medium', name: 'Medium Priority Project' }),
      this.create({ priority: 'high', name: 'High Priority Project' }),
    ];
  }

  static createWithAllStatuses(): Project[] {
    return [
      this.create({ status: 'planning', name: 'Planning Project' }),
      this.create({ status: 'active', name: 'Active Project' }),
      this.create({ status: 'completed', name: 'Completed Project' }),
    ];
  }
}

export class TestDataBuilder {
  private data: Partial<Project> = {};

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withStatus(status: 'planning' | 'active' | 'completed'): this {
    this.data.status = status;
    return this;
  }

  withPriority(priority: 'low' | 'medium' | 'high'): this {
    this.data.priority = priority;
    return this;
  }

  withDescription(description: string): this {
    this.data.description = description;
    return this;
  }

  build(): Project {
    return ProjectFactory.create(this.data);
  }
}
