export interface FunctionExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, any>;
} 