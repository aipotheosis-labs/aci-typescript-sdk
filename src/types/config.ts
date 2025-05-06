export interface ACIConfig {
  apiKey: string;
  baseURL?: string;
  maxRetries?: number;
  retryMaxWait?: number;
  retryMinWait?: number;
  retryMultiplier?: number;
} 