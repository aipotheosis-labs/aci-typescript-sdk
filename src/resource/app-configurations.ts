import { AxiosError } from 'axios';
import { APIResource } from './base';
import {
  AppConfiguration,
  AppConfigurationCreate,
  AppConfigurationsList,
} from '../types/app-configurations';
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
  async list(params: AppConfigurationsList = {}): Promise<AppConfiguration[]> {
    try {
      const validatedParams = this.validateInput(AppConfigurationsSchema.list, params);
      const response = await this.client.get<AppConfiguration[]>('/app-configurations', {
        params: validatedParams,
      });
      return this.handleResponse(response);
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
      const response = await this.client.get<AppConfiguration>(`/app-configurations/${appName}`);
      return this.handleResponse(response);
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Creates a new app configuration.
   * @param params - The configuration parameters.
   * @param params.app_name - The name of the application.
   * @param params.security_scheme - The security scheme for the app configuration.
   * @param params.security_scheme_overrides - Optional overrides for the security scheme.
   * @param params.all_functions_enabled - Whether all functions are enabled by default.
   * @param params.enabled_functions - List of specifically enabled functions.
   * @returns A promise that resolves to the created app configuration.
   * @throws {ValidationError} If the input parameters are invalid.
   */
  async create(params: AppConfigurationCreate): Promise<AppConfiguration> {
    try {
      const validatedData = this.validateInput(AppConfigurationsSchema.create, params);
      const response = await this.client.post<AppConfiguration>(
        '/app-configurations',
        validatedData
      );
      return this.handleResponse(response);
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
      await this.client.delete(`/app-configurations/${appName}`);
      return true;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
}
