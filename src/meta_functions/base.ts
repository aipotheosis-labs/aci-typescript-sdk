/**
 * Functions that define common functionality and structure
 * for all meta function implementations.
 */
import { FunctionDefinitionFormat } from '../types/functions';

/**
 * Base schema interface for meta functions
 */
export interface BaseSchema {
  name: string;
  description: string;
  parameters: Record<string, any>;
  [key: string]: any;
}

/**
 * Convert a base schema to a format-specific schema
 * 
 * @param baseSchema - The base schema to convert
 * @param format - The schema format to use (OPENAI, ANTHROPIC, etc.)
 * @returns Schema formatted according to the specified format
 */
export const toJsonSchema = (
  baseSchema: BaseSchema, 
  format: FunctionDefinitionFormat = FunctionDefinitionFormat.OPENAI
): Record<string, any> => {
  switch (format) {
    case FunctionDefinitionFormat.OPENAI:
      return {
        type: "function",
        function: {
          name: baseSchema.name,
          description: baseSchema.description,
          parameters: baseSchema.parameters,
        },
      };
    
    case FunctionDefinitionFormat.OPENAI_RESPONSES:
      return {
        type: "function",
        name: baseSchema.name,
        description: baseSchema.description,
        parameters: baseSchema.parameters,
      };
    
    case FunctionDefinitionFormat.ANTHROPIC:
      return {
        name: baseSchema.name,
        description: baseSchema.description,
        input_schema: baseSchema.parameters,
      };
    
    default:
      throw new Error(`Unsupported schema format: ${format}`);
  }
};

/**
 * Creates a function that converts a schema to a specific format
 * 
 * @param getBaseSchema - Function that returns the base schema
 * @returns Function that converts the schema to a specified format
 */
export const createSchemaFormatter = (
  getBaseSchema: () => BaseSchema
) => {
  return {
    getSchema: () => getBaseSchema(),
    toJsonSchema: (format: FunctionDefinitionFormat = FunctionDefinitionFormat.OPENAI) => 
      toJsonSchema(getBaseSchema(), format)
  };
}; 