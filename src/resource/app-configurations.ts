import { AxiosError } from 'axios';
import { APIResource } from './base';
import { AppConfiguration } from '../types/app-configurations';
import { SecurityScheme } from '../types/enums';

export class AppConfigurationsResource extends APIResource {
  async list(params: {
    app_names?: string[];
    limit?: number;
    offset?: number;
  }): Promise<AppConfiguration[]> {
    try {
      const response = await this.client.get('/app-configurations', { params });
      return this.handleResponse<AppConfiguration[]>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async get(appName: string): Promise<AppConfiguration> {
    try {
      const response = await this.client.get(`/app-configurations/${appName}`);
      return this.handleResponse<AppConfiguration>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async create(appName: string, securityScheme: SecurityScheme): Promise<AppConfiguration> {
    try {
      const response = await this.client.post('/app-configurations', {
        app_name: appName,
        security_scheme: securityScheme,
      });
      return this.handleResponse<AppConfiguration>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async delete(appName: string): Promise<void> {
    try {
      await this.client.delete(`/app-configurations/${appName}`);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
} 