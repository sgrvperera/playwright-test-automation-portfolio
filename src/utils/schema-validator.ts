import Ajv, { JSONSchemaType } from 'ajv';
import { TestLogger } from './logger';

const ajv = new Ajv({ allErrors: true });

export class SchemaValidator {
  static validate<T>(data: unknown, schema: JSONSchemaType<T>): T {
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors = validate.errors?.map((err) => `${err.instancePath} ${err.message}`).join(', ');
      TestLogger.error(`Schema validation failed: ${errors}`);
      throw new Error(`Schema validation failed: ${errors}`);
    }

    TestLogger.debug('Schema validation passed');
    return data as T;
  }
}

export const ProjectSchema: JSONSchemaType<{
  id: string;
  name: string;
  status: string;
  priority: string;
  description: string;
  owner: string;
  createdAt: string;
}> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    name: { type: 'string' },
    status: { type: 'string', enum: ['planning', 'active', 'completed'] },
    priority: { type: 'string', enum: ['low', 'medium', 'high'] },
    description: { type: 'string' },
    owner: { type: 'string' },
    createdAt: { type: 'string' },
  },
  required: ['id', 'name', 'status', 'priority', 'description', 'owner', 'createdAt'],
  additionalProperties: false,
};

export const ProjectsResponseSchema: JSONSchemaType<{
  success: boolean;
  data: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
    description: string;
    owner: string;
    createdAt: string;
  }>;
  total: number;
}> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    data: {
      type: 'array',
      items: ProjectSchema,
    },
    total: { type: 'number' },
  },
  required: ['success', 'data', 'total'],
  additionalProperties: false,
};

export const AuthResponseSchema: JSONSchemaType<{
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  message?: string;
}> = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    token: { type: 'string', nullable: true },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
      },
      required: ['id', 'email', 'name', 'role'],
      nullable: true,
    },
    message: { type: 'string', nullable: true },
  },
  required: ['success'],
  additionalProperties: false,
};
