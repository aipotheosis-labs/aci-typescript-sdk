export interface FunctionExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export enum FunctionDefinitionFormat {
  OPENAI = 'openai',
  BASIC = 'basic',
  OPENAI_RESPONSES = 'openai_responses',
  ANTHROPIC = 'anthropic',
}

export interface BasicFunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface OpenAIFunctionDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface OpenAIResponsesFunctionDefinition {
  type: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface AnthropicFunctionDefinition {
  name: string;
  description: string;
  input_schema: Record<string, any>;
}

export type FunctionDefinition =
  | BasicFunctionDefinition
  | OpenAIFunctionDefinition
  | OpenAIResponsesFunctionDefinition
  | AnthropicFunctionDefinition;

export interface GetFunctionDefinitionParams {
  /** Name of the function to retrieve */
  function_name: string;
  /** Format of the function definition to return */
  format: FunctionDefinitionFormat;
}

export interface FunctionExecutionParams {
  /** Name of the function to execute */
  function_name: string;
  /** Dictionary containing all input arguments required to execute the specified function */
  function_arguments: Record<string, any>;
  /** Specifies with credentials of which linked account the function should be executed */
  linked_account_owner_id: string;
}

export interface SearchFunctionsParams {
  /** List of app names to filter functions by */
  app_names?: string[];
  /** Intent to search for relevant functions */
  intent?: string;
  /** If true, only returns enabled functions from apps that are allowed by the agent/accessor */
  allowed_only?: boolean;
  /** Format of the function definition to return */
  format?: FunctionDefinitionFormat;
  /** Maximum number of functions to return */
  limit?: number;
  /** Pagination offset */
  offset?: number;
}

export interface Function {
  /** Name of the function */
  name: string;
  /** Description of the function */
  description: string;
}

export interface FunctionDetails {
  /** Unique identifier of the function */
  id: string;
  /** Name of the app the function belongs to */
  app_name: string;
  /** Name of the function */
  name: string;
  /** Description of the function */
  description: string;
  /** List of tags associated with the function */
  tags: string[];
  /** Visibility status of the function */
  visibility: string;
  /** Whether the function is active */
  active: boolean;
  /** Protocol used by the function */
  protocol: string;
  /** Protocol-specific data */
  protocol_data: Record<string, any>;
  /** Function parameters schema */
  parameters: Record<string, any>;
  /** Function response schema */
  response: Record<string, any>;
}
