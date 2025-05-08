export interface FunctionExecutionResult {
  success: boolean;
  data?: object;
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
  parameters: Record<string, object>;
}

export interface OpenAIFunctionDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: Record<string, object>;
  };
}

export interface OpenAIResponsesFunctionDefinition {
  type: string;
  name: string;
  description: string;
  parameters: Record<string, object>;
}

export interface AnthropicFunctionDefinition {
  name: string;
  description: string;
  input_schema: Record<string, object>;
}

export type FunctionDefinition =
  | BasicFunctionDefinition
  | OpenAIFunctionDefinition
  | OpenAIResponsesFunctionDefinition
  | AnthropicFunctionDefinition;
