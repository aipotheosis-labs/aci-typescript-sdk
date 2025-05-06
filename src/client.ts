import axios, { AxiosInstance } from 'axios';
import axiosRetry, { IAxiosRetryConfig } from 'axios-retry';
import { ACIConfig } from './types/config';
import {
  DEFAULT_BASE_URL,
  DEFAULT_MAX_RETRIES,
  DEFAULT_RETRY_MAX_WAIT,
  DEFAULT_RETRY_MIN_WAIT,
  DEFAULT_RETRY_MULTIPLIER,
} from './constants';
import { AppsResource } from './resource/apps';
import { AppConfigurationsResource } from './resource/app-configurations';
import { LinkedAccountsResource } from './resource/linked-accounts';
import { FunctionsResource } from './resource/functions';

export class ACI {
  private client: AxiosInstance;
  private config: Required<ACIConfig>;

  public readonly apps: AppsResource;
  public readonly appConfigurations: AppConfigurationsResource;
  public readonly linkedAccounts: LinkedAccountsResource;
  public readonly functions: FunctionsResource;

  constructor(config: ACIConfig) {
    this.config = {
      baseURL: config.baseURL || DEFAULT_BASE_URL,
      maxRetries: config.maxRetries || DEFAULT_MAX_RETRIES,
      retryMaxWait: config.retryMaxWait || DEFAULT_RETRY_MAX_WAIT,
      retryMinWait: config.retryMinWait || DEFAULT_RETRY_MIN_WAIT,
      retryMultiplier: config.retryMultiplier || DEFAULT_RETRY_MULTIPLIER,
      apiKey: config.apiKey || process.env.ACI_API_KEY || '',
    };

    if (!this.config.apiKey) {
      throw new Error('API key is required. Either pass it in config or set ACI_API_KEY environment variable.');
    }

    this.client = axios.create({
      baseURL: this.config.baseURL,
      headers: {
        'x-api-key': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.client.interceptors.request.use((config) => {
      console.log('Request:', {
        method: config.method,
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
      return config;
    });

    this.setupRetry();

    // Initialize resources
    this.apps = new AppsResource(this.client);
    this.appConfigurations = new AppConfigurationsResource(this.client);
    this.linkedAccounts = new LinkedAccountsResource(this.client);
    this.functions = new FunctionsResource(this.client);
  }

  private setupRetry() {
    const retryConfig: IAxiosRetryConfig = {
      retries: this.config.maxRetries,
      retryDelay: (retryCount: number) => {
        const delay = Math.min(
          this.config.retryMinWait * Math.pow(this.config.retryMultiplier, retryCount),
          this.config.retryMaxWait
        );
        return delay;
      },
      retryCondition: (error) => {
        const status = error.response?.status;
        return (
          axiosRetry.isNetworkOrIdempotentRequestError(error) ||
          status === 429 ||
          (status !== undefined && status >= 500 && status < 600)
        );
      },
    };

    axiosRetry(this.client, retryConfig);
  }
} 