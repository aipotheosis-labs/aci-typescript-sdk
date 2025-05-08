import { SecurityScheme } from './apps';

export interface AppConfiguration {
  app_name: string;
  security_scheme: SecurityScheme;
  created_at: string;
  updated_at: string;
}
