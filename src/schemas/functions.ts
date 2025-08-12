import { z } from 'zod';
import { FunctionDefinitionFormat } from '../types/functions';

export const FunctionsSchema = {
  search: z.object({
    app_names: z.array(z.string()).optional(),
    intent: z.string().optional(),
    allowed_apps_only: z.boolean().optional(),
    allowed_only: z.boolean().optional(),
    format: z.nativeEnum(FunctionDefinitionFormat).optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  }),

  getDefinition: z.object({
    functionName: z.string(),
    format: z
      .nativeEnum(FunctionDefinitionFormat)
      .optional()
      .default(FunctionDefinitionFormat.OPENAI),
  }),

  execute: z.object({
    function_name: z.string(),
    function_parameters: z.record(z.any()),
    linked_account_owner_id: z.string(),
  }),
};
