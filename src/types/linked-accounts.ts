import { SecurityScheme } from './apps';

/** Base interface for creating a linked account */
export interface LinkedAccountCreateBase {
  /** Name of the app to link */
  app_name: string;
  /** ID of the account owner */
  linked_account_owner_id: string;
}

/** Interface for creating an OAuth2 linked account */
export interface LinkedAccountOAuth2Create extends LinkedAccountCreateBase {
  /** URL to redirect to after OAuth2 linking */
  after_oauth2_link_redirect_url?: string;
}

/** Interface for creating an API key linked account */
export interface LinkedAccountAPIKeyCreate extends LinkedAccountCreateBase {
  /** API key for authentication */
  api_key: string;
}

/** Interface for creating a no-auth linked account */
export interface LinkedAccountNoAuthCreate extends LinkedAccountCreateBase {}

/** Interface for updating a linked account */
export interface LinkedAccountUpdate {
  /** Whether the linked account is enabled */
  enabled?: boolean;
}

/** Public representation of a linked account */
export interface LinkedAccount {
  /** Unique identifier of the linked account */
  id: string;
  /** Unique identifier of the project */
  project_id: string;
  /** Name of the app */
  app_name: string;
  /** ID of the account owner */
  linked_account_owner_id: string;
  /** Security scheme used for authentication */
  security_scheme: SecurityScheme;
  /** Whether the linked account is enabled */
  enabled: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** Security credentials for the linked account */
  security_credentials?: {
    /** Access token for OAuth2 authentication */
    access_token?: string;
    /** Secret key for API key authentication */
    secret_key?: string;
  };
  /** Additional properties */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/** Parameters for listing linked accounts */
export interface LinkedAccountsList {
  /** Name of the app to filter by */
  app_name?: string;
  /** ID of the account owner to filter by */
  linked_account_owner_id?: string;
}
