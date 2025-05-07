import { z } from 'zod';

export const updateAgentAllowedApps = z.object({
  allowed_apps: z.array(z.string())
}); 