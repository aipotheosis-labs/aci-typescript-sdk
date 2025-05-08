import { SecurityScheme } from './apps';

export interface AppConfiguration {
  id: string;
  project_id: string;
  app_name: string;
  security_scheme: SecurityScheme;
  enabled: boolean;
  all_functions_enabled: boolean;
  enabled_functions: string[];
  created_at: string;
  updated_at: string;
  [key: string]: any; // Allow extra fields for backward compatibility
}

export interface AppConfigurationCreate {
  app_name: string;
  security_scheme: SecurityScheme;
  security_scheme_overrides?: Record<string, any>;
  all_functions_enabled?: boolean;
  enabled_functions?: string[];
}

export interface AppConfigurationsList {
  app_names?: string[];
  limit?: number;
  offset?: number;
}
