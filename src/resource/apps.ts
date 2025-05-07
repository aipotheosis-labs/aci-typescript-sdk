import { AxiosError } from 'axios';
import { APIResource } from './base';
import { AppBasic, AppDetails } from '../types/apps';
import { ValidationError } from '../exceptions';
import { AppsSchema } from '../schemas';

export class AppsResource extends APIResource {
  async search(params: {
    intent?: string;
    allowed_apps_only?: boolean;
    include_functions?: boolean;
    categories?: string[];
    limit?: number;
    offset?: number;
  }): Promise<AppBasic[]> {
    try {
      const validatedParams = this.validateInput(AppsSchema.search, params);
      const response = await this.client.get('/apps/search', { params: validatedParams });
      return this.handleResponse<AppBasic[]>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  async get(appName: string): Promise<AppDetails> {
    try {
      // Simple string parameter - TypeScript provides static checking
      const response = await this.client.get(`/apps/${appName}`);
      return this.handleResponse<AppDetails>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
} 