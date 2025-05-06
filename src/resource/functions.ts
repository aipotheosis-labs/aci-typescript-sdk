import { AxiosError } from 'axios';
import { APIResource } from './base';
import { FunctionExecutionResult, FunctionDefinition } from '../types/functions';
import { FunctionDefinitionFormat } from '../types/enums';

/**
 * Resource class for interacting with ACI Functions API endpoints.
 * Provides methods for searching, retrieving definitions, and executing functions.
 */
export class FunctionsResource extends APIResource {
  /**
   * Searches for functions based on specified criteria.
   * TODO: return specific type for returned functions based on FunctionDefinitionFormat
   * 
   * @param params - Search parameters
   * @param params.app_names - List of app names to filter functions by
   * @param params.intent - Search results will be sorted by relevance to this intent
   * @param params.allowed_apps_only - If true, only returns functions of apps that are allowed by the agent/accessor
   * @param params.format - Format of the function definitions to return
   * @param params.limit - For pagination, maximum number of functions to return
   * @param params.offset - For pagination, number of functions to skip before returning results
   * @returns Promise resolving to an array of function definitions matching the search criteria
   * @throws Various exceptions for different HTTP status codes
   */
  async search(params: {
    app_names?: string[];
    intent?: string;
    allowed_apps_only?: boolean;
    format?: FunctionDefinitionFormat;
    limit?: number;
    offset?: number;
  }): Promise<FunctionDefinition[]> {
    try {
      const response = await this.client.get('/functions/search', { params });
      return this.handleResponse<FunctionDefinition[]>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Retrieves the definition of a specific function.
   * TODO: return specific type for returned function definition based on FunctionDefinitionFormat
   * 
   * @param functionName - Name of the function to retrieve
   * @param format - Format of the function definition to return
   * @returns Promise resolving to the function definition
   * @throws Various exceptions for different HTTP status codes
   */
  async getDefinition(
    functionName: string,
    format: FunctionDefinitionFormat = FunctionDefinitionFormat.OPENAI
  ): Promise<FunctionDefinition> {
    try {
      const response = await this.client.get(`/functions/${functionName}/definition`, {
        params: { format },
      });
      return this.handleResponse<FunctionDefinition>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Executes an ACI indexed function (tool) with the provided arguments.
   * 
   * @param params - Execution parameters
   * @param params.function_name - Name of the function to execute
   * @param params.function_parameters - Dictionary containing the input arguments for the function
   * @param params.linked_account_owner_id - Specifies which linked account's credentials should be used for execution
   * @returns Promise resolving to the function execution result
   * @throws Various exceptions for different HTTP status codes
   */
  async execute(params: {
    function_name: string;
    function_parameters: Record<string, any>;
    linked_account_owner_id: string;
  }): Promise<FunctionExecutionResult> {
    try {
      const response = await this.client.post('/functions/execute', params);
      return this.handleResponse<FunctionExecutionResult>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
} 