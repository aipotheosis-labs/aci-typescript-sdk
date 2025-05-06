import { SecurityScheme } from './enums';

export interface LinkedAccount {
  id: string;
  app_name: string;
  linked_account_owner_id: string;
  security_scheme: SecurityScheme;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
} 