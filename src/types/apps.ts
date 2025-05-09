import { Function as AppFunction, FunctionDetails } from './functions';
export enum SecurityScheme {
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  NO_AUTH = 'no_auth',
}

export interface AppBasic {
  name: string;
  description: string;
  functions?: AppFunction[];
}

export interface AppDetails {
  id: string;
  name: string;
  display_name: string;
  provider: string;
  version: string;
  description: string;
  logo?: string;
  categories: string[];
  visibility: string;
  active: boolean;
  security_schemes: string[];
  functions: FunctionDetails[];
}
