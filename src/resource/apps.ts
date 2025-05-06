import { AxiosError } from 'axios';
import { APIResource } from './base';
import { AppBasic, AppDetails } from '../types/apps';

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
      console.log('Searching for apps...');
      const response = await this.client.get('/apps/search', { params });
      console.log(response.data);
      return this.handleResponse<AppBasic[]>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async get(appName: string): Promise<AppDetails> {
    try {
      const response = await this.client.get(`/apps/${appName}`);
      return this.handleResponse<AppDetails>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
} 