/**
 * This module defines the ACI_SEARCH_FUNCTIONS meta function, which can be used by LLMs/Agents to search for
 * relevant executable functions that can help complete tasks.
 *
 * Use this meta function when you want an LLM to discover relevant executable functions based on
 * the user's intent.
 */
import { BaseSchema, createSchemaFormatter } from './base';

/**
 * Schema definition for the ACI_SEARCH_FUNCTIONS meta function
 */
const aciSearchFunctionsBaseSchema: BaseSchema = {
  name: "ACI_SEARCH_FUNCTIONS",
  description: "This function allows you to find relevant executable functions and their schemas that can help complete your tasks.",
  parameters: {
    type: "object",
    properties: {
      intent: {
        type: "string",
        description: "Use this to find relevant functions you might need. Returned results will be sorted by relevance to the intent.",
      },
      limit: {
        type: "integer",
        default: 100,
        description: "The maximum number of functions to return from the search per response.",
        minimum: 1,
      },
      offset: {
        type: "integer",
        default: 0,
        minimum: 0,
        description: "Pagination offset.",
      },
    },
    required: [],
    additionalProperties: false,
  },
};

/**
 * Get the base schema for ACI search functions
 */
export const getAciSearchFunctionsSchema = () => aciSearchFunctionsBaseSchema;

/**
 * Create formatted schema utilities for ACI search functions
 */
export const ACISearchFunctions = createSchemaFormatter(getAciSearchFunctionsSchema);