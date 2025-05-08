import { AxiosError } from 'axios';
import { APIResource } from './base';
import { AppConfiguration } from '../types/app-configurations';
import { SecurityScheme } from '../types/apps';
import { ValidationError } from '../exceptions';
import { AppConfigurationsSchema } from '../schemas';

export class AppConfigurationsResource extends APIResource {
  /**
   * Lists app configurations based on specified criteria.
   * @param params - The listing parameters.
   * @param params.app_names - Optional list of app names to filter configurations by.
   * @param params.limit - Optional limit on the number of results to return.
   * @param params.offset - Optional offset for paginating through results.
   * @returns A promise that resolves to an array of app configurations.
   * @throws {ValidationError} If the input parameters are invalid.
   */
  async list(params: {
    app_names?: string[];
    limit?: number;
    offset?: number;
  }): Promise<AppConfiguration[]> {
    try {
      const validatedParams = this.validateInput(AppConfigurationsSchema.list, params);
      const response = await this.client.get('/app-configurations', {
        params: validatedParams,
      });
      return this.handleResponse<AppConfiguration[]>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Retrieves a specific app configuration.
   * @param appName - The name of the application whose configuration is to be retrieved.
   * @returns A promise that resolves to the app configuration, or null if not found.
   */
  async get(appName: string): Promise<AppConfiguration | null> {
    try {
      // No need to validate simple string parameters that TypeScript already checks
      const response = await this.client.get(`/app-configurations/${appName}`);
      return this.handleResponse<AppConfiguration>(response);
    } catch (error) {
      // Return null if the configuration doesn't exist
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Creates a new app configuration.
   * @param appName - The name of the application for which to create the configuration.
   * @param securityScheme - The security scheme for the app configuration.
   * @returns A promise that resolves to the created app configuration.
   * @throws {ValidationError} If the input parameters are invalid.
   */
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

  /**
   * Deletes an app configuration.
   * @param appName - The name of the application whose configuration is to be deleted.
   * @returns A promise that resolves to true if the deletion was successful, otherwise an error is thrown.
   */
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
