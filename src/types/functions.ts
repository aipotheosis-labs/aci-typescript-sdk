export interface FunctionExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}



export enum FunctionDefinitionFormat {
  OPENAI = "openai",
  BASIC = "basic",
  OPENAI_RESPONSES = "openai_responses",
  ANTHROPIC = "anthropic"
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

export type FunctionDefinition = BasicFunctionDefinition | OpenAIFunctionDefinition | OpenAIResponsesFunctionDefinition | AnthropicFunctionDefinition;