import axios, { AxiosInstance } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { ACIConfig } from './types/config';
import {
  DEFAULT_BASE_URL,
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_MAX_WAIT,
  DEFAULT_RETRY_MIN_WAIT,
  DEFAULT_RETRY_MULTIPLIER,
  ACI_SEARCH_FUNCTIONS,
  ACI_EXECUTE_FUNCTION,
} from './constants';
import {
  AppsResource,
  AppConfigurationsResource,
  LinkedAccountsResource,
  FunctionsResource,
} from './resource';
import { FunctionDefinitionFormat } from './types/functions';

interface HandleFunctionCallParams {
  /** Name of the function to be called */
  functionName: string;
  /** Dictionary containing all input arguments required to execute the specified function */
  functionArguments: Record<string, any>;
  /** Specifies with credentials of which linked account the function should be executed */
  linkedAccountOwnerId?: string;
  /** @deprecated Use allowedOnly instead. If true, only returns enabled functions of apps that are allowed to be used by the agent/accessor */
  allowedAppsOnly?: boolean;
  /** If true, only returns enabled functions of apps that are allowed to be used by the agent/accessor. If false, returns all functions of all apps. */
  allowedOnly?: boolean;
  /** Format of the function definition to return */
  format?: FunctionDefinitionFormat;
}

export class ACI {
  private client: AxiosInstance;
  private config: Required<ACIConfig>;

  public readonly apps: AppsResource;
  public readonly appConfigurations: AppConfigurationsResource;
  public readonly linkedAccounts: LinkedAccountsResource;
  public readonly functions: FunctionsResource;
  constructor(config: ACIConfig) {
    this.config = {
      baseURL: config.baseURL || DEFAULT_BASE_URL,
      apiKey: config.apiKey || process.env.ACI_API_KEY || '',
    };

    if (!this.config.apiKey) {
      throw new Error(
        'API key is required. Either pass it in config or set ACI_API_KEY environment variable.'
      );
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    });

    this.client.interceptors.request.use(config => {
      return config;
    });

    this.setupRetry();

    // Initialize resources
    this.apps = new AppsResource(this.client);
    this.appConfigurations = new AppConfigurationsResource(this.client);
    this.linkedAccounts = new LinkedAccountsResource(this.client);
    this.functions = new FunctionsResource(this.client);
  }

  private setupRetry() {
    const retryConfig: IAxiosRetryConfig = {
      retries: DEFAULT_MAX_RETRIES,
      retryDelay: (retryCount: number) => {
        const delay = Math.min(
          DEFAULT_RETRY_MIN_WAIT * Math.pow(DEFAULT_RETRY_MULTIPLIER, retryCount),
          DEFAULT_RETRY_MAX_WAIT
        );
        return delay;
      },
      retryCondition: error => {
        const status = error.response?.status;
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          status === 429 ||
          (status !== undefined && status >= 500 && status < 600)
        );
      },
    };

    axiosRetry(this.client, retryConfig);
  }

  /**
   * Routes and executes function calls based on the function name.
   * This is a convenience function to handle function calls from LLM without checking the function name.
   *
   * It supports handling built-in meta functions (ACI_SEARCH_FUNCTIONS, ACI_EXECUTE_FUNCTION) and also handling
   * executing third-party functions directly.
   * 
   * @param {HandleFunctionCallParams} params
   * @returns The result of the function execution (varies based on the function)
   */
  public async handleFunctionCall(params: HandleFunctionCallParams): Promise<any> {
    const { functionName, functionArguments, linkedAccountOwnerId, allowedOnly, allowedAppsOnly, format } =
      params;

    if (functionName === ACI_SEARCH_FUNCTIONS) {
      const functions = await this.functions.search({
        ...functionArguments,
        allowed_only: allowedOnly || allowedAppsOnly,
        format: format,
      });

      return functions;
    } else if (functionName === ACI_EXECUTE_FUNCTION) {
      // Handle special case where function arguments might not be wrapped correctly
      let processedArgs = functionArguments;

      // If function_arguments is missing but function_name is present, wrap the arguments
      if (!('function_arguments' in functionArguments) && 'function_name' in functionArguments) {
        const { function_name, ...rest } = functionArguments;
        processedArgs = {
          function_name,
          function_arguments: rest,
        };
      }

      const result = await this.functions.execute({
        function_name: processedArgs.function_name,
        function_parameters: processedArgs.function_arguments,
        linked_account_owner_id: linkedAccountOwnerId as string,
      });

      // Return result directly
      return result;
    } else {
      // For direct function execution, assume functionName is the name of the function to execute
      const result = await this.functions.execute({
        function_name: functionName,
        function_parameters: functionArguments,
        linked_account_owner_id: linkedAccountOwnerId as string,
      });

      // Return result directly
      return result;
    }
  }
}
