export enum SecurityScheme {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  NO_AUTH = 'no_auth'
}

export interface AppBasic {
  name: string;
  description: string;
  categories: string[];
  functions?: {
    name: string;
    description: string;
  }[];
}

export interface AppDetails extends AppBasic {
  functions: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  }[];
} 