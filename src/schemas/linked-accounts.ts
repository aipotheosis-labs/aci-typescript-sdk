import { z } from 'zod';
import { SecurityScheme } from '../types/apps';

export const LinkedAccountsSchema = {
  link: z.object({
    app_name: z.string(),
    linked_account_owner_id: z.string(),
    security_scheme: z.nativeEnum(SecurityScheme),
    api_key: z.string().optional(),
    after_oauth2_link_redirect_url: z.string().optional(),
  }),
  
  list: z.object({
    app_name: z.string().optional(),
    linked_account_owner_id: z.string().optional(),
  })
}; 