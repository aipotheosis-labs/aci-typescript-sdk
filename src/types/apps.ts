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