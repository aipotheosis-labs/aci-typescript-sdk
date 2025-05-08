import { z } from 'zod';
import { SecurityScheme } from '../types/apps';

export const AppConfigurationsSchema = {
  list: z.object({
    app_names: z.array(z.string()).optional(),
    limit: z.number().int().positive().optional(),
    offset: z.number().int().nonnegative().optional(),
  }),

  create: z.object({
    app_name: z.string(),
    security_scheme: z.nativeEnum(SecurityScheme),
    security_scheme_overrides: z.record(z.any()).optional(),
    all_functions_enabled: z.boolean().optional().default(true),
    enabled_functions: z.array(z.string()).optional(),
  }),
};
