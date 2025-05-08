/**
 * This module defines the ACI_EXECUTE_FUNCTION meta function, which can be used by LLMs to send
 * execution requests for functions discovered and selected through ACI_SEARCH_FUNCTIONS.
 *
 * This is typically the final step in the dynamic function discovery and execution flow:
 * 1. Use ACI_SEARCH_FUNCTIONS to find relevant functions
 * 2. Use ACI_EXECUTE_FUNCTION to actually execute the chosen function with proper arguments
 */
import { BaseSchema, createSchemaFormatter } from './base';

/**
 * Schema definition for the ACI_EXECUTE_FUNCTION meta function
 */
const aciExecuteFunctionBaseSchema: BaseSchema = {
  name: "ACI_EXECUTE_FUNCTION",
  description: "Execute a specific retrieved function. Provide the executable function name, and the required function parameters for that function.",
  parameters: {
    type: "object",
    properties: {
      function_name: {
        type: "string",
        description: "The name of the function to execute",
      },
      function_arguments: {
        type: "object",
        description: "A dictionary containing key-value pairs of input parameters required by the specified function. If the function requires no parameters, provide an empty object.",
        additionalProperties: true,
      },
    },
    required: ["function_name", "function_arguments"],
    additionalProperties: false,
  },
};

/**
 * Get the base schema for ACI execute function
 */
export const getAciExecuteFunctionSchema = () => aciExecuteFunctionBaseSchema;

/**
 * Create formatted schema utilities for ACI execute function
 */
export const ACIExecuteFunction = createSchemaFormatter(getAciExecuteFunctionSchema);


/**
 * Helper function for cases where LLMs output function arguments without the function_arguments key.
 * @param {Object} obj - The object to process
 * @returns {Object} - The processed object with correct structure
 */
export const wrapFunctionArgumentsIfNotPresent = (obj: {[key: string]: any}): {[key: string]: any} => {
  // If already in the right format, return as is
  if ("function_arguments" in obj) {
    return obj;
  }
  
  // Create a copy without modifying the original object
  const { function_name, ...rest } = obj;
  
  // Return new object with correct structure
  return {
    function_name,
    function_arguments: rest,
  };
}; 