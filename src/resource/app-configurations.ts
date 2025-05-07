import { AxiosError } from 'axios';
import { APIResource } from './base';
import { AppConfiguration } from '../types/app-configurations';
import { SecurityScheme } from '../types/apps';
import { ValidationError } from '../exceptions';
import { AppConfigurationsSchema } from '../schemas';

export class AppConfigurationsResource extends APIResource {
  async list(params: {
    app_names?: string[];
    limit?: number;
    offset?: number;
  }): Promise<AppConfiguration[]> {
    try {
      const validatedParams = this.validateInput(AppConfigurationsSchema.list, params);
      const response = await this.client.get('/app-configurations', {
        params: validatedParams 
      });
      return this.handleResponse<AppConfiguration[]>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  async get(appName: string): Promise<AppConfiguration> {
    try {
      // No need to validate simple string parameters that TypeScript already checks
      const response = await this.client.get(`/app-configurations/${appName}`);
      return this.handleResponse<AppConfiguration>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async create(appName: string, securityScheme: SecurityScheme): Promise<AppConfiguration> {
    try {
      const validatedData = this.validateInput(AppConfigurationsSchema.create, {
        app_name: appName,
        security_scheme: securityScheme,
      });
      
      const response = await this.client.post('/app-configurations', validatedData);
      return this.handleResponse<AppConfiguration>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  async delete(appName: string): Promise<boolean> {
    try {
      // No need to validate simple string parameters that TypeScript already checks
      await this.client.delete(`/app-configurations/${appName}`);
      return true;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
} 