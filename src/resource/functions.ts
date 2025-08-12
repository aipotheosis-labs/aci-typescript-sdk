import { AxiosError } from 'axios';
import { APIResource } from './base';
import {
  FunctionExecutionResult,
  FunctionDefinition,
  FunctionDefinitionFormat,
  SearchFunctionsParams,
} from '../types/functions';
import { ValidationError } from '../exceptions';
import { FunctionsSchema } from '../schemas';

/**
 * Resource class for interacting with ACI Functions API endpoints.
 * Provides methods for searching, retrieving definitions, and executing functions.
 */
export class FunctionsResource extends APIResource {
  /**
   * Transforms the format enum value to lowercase for API compatibility
   */
  private formatToLowercase(format: FunctionDefinitionFormat | undefined): string | undefined {
    if (!format) return undefined;
    return format.toLowerCase();
  }

  /**
   * Searches for functions based on specified criteria.
   * TODO: return specific type for returned functions based on FunctionDefinitionFormat
   *
   * @param {SearchFunctionsParams} params
   * @returns Promise resolving to an array of function definitions matching the search criteria
   * @throws Various exceptions for different HTTP status codes
   */
  async search(params: SearchFunctionsParams): Promise<FunctionDefinition[]> {
    try {
      // Validate params with Zod
      const validatedParams = this.validateInput(FunctionsSchema.search, params);

      // Create a new params object with the format converted to lowercase
      const apiParams = {
        ...validatedParams,
        format: this.formatToLowercase(validatedParams.format),
      };

      const response = await this.client.get('/functions/search', {
        params: apiParams,
      });
      return this.handleResponse<FunctionDefinition[]>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
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
      // Validate parameters with Zod
      const validatedParams = this.validateInput(FunctionsSchema.getDefinition, {
        functionName,
        format,
      });

      // Convert the format to lowercase for API compatibility
      const formatParam = this.formatToLowercase(validatedParams.format);

      const response = await this.client.get(
        `/functions/${validatedParams.functionName}/definition`,
        {
          params: { format: formatParam },
        }
      );
      return this.handleResponse<FunctionDefinition>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
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
      // Validate params with Zod
      const validatedParams = this.validateInput(FunctionsSchema.execute, params);

      const requestBody = {
        function_input: validatedParams.function_parameters,
        linked_account_owner_id: validatedParams.linked_account_owner_id,
      };

      const response = await this.client.post(
        `/functions/${validatedParams.function_name}/execute`,
        requestBody
      );
      return this.handleResponse<FunctionExecutionResult>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }
}
