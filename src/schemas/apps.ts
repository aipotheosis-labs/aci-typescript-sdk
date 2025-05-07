import { z } from 'zod';

// Define validation schemas for Apps resource
export const AppsSchema = {
  search: z.object({
    intent: z.string().optional(),
    allowed_apps_only: z.boolean().optional(),
    include_functions: z.boolean().optional(),
    categories: z.array(z.string()).optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  }),
}; 