export enum SecurityScheme {
  API_KEY = 'API_KEY',
  OAUTH2 = 'OAUTH2',
  NO_AUTH = 'NO_AUTH'
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