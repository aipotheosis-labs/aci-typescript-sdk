import { AxiosError } from 'axios';
import { APIResource } from './base';
import { AppBasic, AppDetails } from '../types/apps';
import { ValidationError } from '../exceptions';
import { AppsSchema } from '../schemas';

export class AppsResource extends APIResource {
  /**
   * Searches for applications based on specified criteria.
   * @param params - The search parameters.
   * @param params.intent - Optional intent to filter apps by.
   * @param params.allowed_apps_only - Optional flag to include only allowed apps.
   * @param params.include_functions - Optional flag to include app functions in the response.
   * @param params.categories - Optional list of categories to filter apps by.
   * @param params.limit - Optional limit on the number of results to return.
   * @param params.offset - Optional offset for paginating through results.
   * @returns A promise that resolves to an array of basic app information.
   * @throws {ValidationError} If the input parameters are invalid.
   */
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
      const response = await this.client.get('/apps/search', {
        params: validatedParams,
      });
      return this.handleResponse<AppBasic[]>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Retrieves details for a specific application.
   * @param appName - The name of the application to retrieve.
   * @returns A promise that resolves to the detailed application information.
   */
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
