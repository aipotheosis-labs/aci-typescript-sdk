import { SecurityScheme } from './apps';

export interface LinkedAccount {
  id: string;
  app_name: string;
  linked_account_owner_id: string;
  security_scheme: SecurityScheme;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
