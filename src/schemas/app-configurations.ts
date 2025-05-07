import { z } from 'zod';
import { SecurityScheme } from '../types/apps';

export const AppConfigurationsSchema = {
  list: z.object({
    app_names: z.array(z.string()).optional(),
    limit: z.number().optional(),
    offset: z.number().optional(),
  }),
  
  create: z.object({
    app_name: z.string(),
    security_scheme: z.nativeEnum(SecurityScheme),
  })
}; 