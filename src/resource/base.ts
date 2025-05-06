import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthenticationError,
  PermissionError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  UnknownError,
} from '../exceptions';

export class APIResource {
  protected client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  protected handleResponse<T>(response: any): T {
    return response.data;
  }

  protected handleError(error: AxiosError): never {
    if (!error.response) {
      throw new UnknownError('Network error occurred');
    }

    const status = error.response.status;
    const errorMessage = this.getErrorMessage(error);

    switch (status) {
      case 401:
        throw new AuthenticationError(errorMessage);
      case 403:
        throw new PermissionError(errorMessage);
      case 404:
        throw new NotFoundError(errorMessage);
      case 400:
        throw new ValidationError(errorMessage);
      case 429:
        throw new RateLimitError(errorMessage);
      case 500:
      case 502:
      case 503:
      case 504:
        throw new ServerError(errorMessage);
      default:
        throw new UnknownError(errorMessage);
    }
  }

  private getErrorMessage(error: AxiosError): string {
    if (error.response?.data) {
      try {
        const data = typeof error.response.data === 'string' 
          ? JSON.parse(error.response.data) 
          : error.response.data;
        return data.message || data.error || JSON.stringify(data);
      } catch {
        return error.response.data.toString();
      }
    }
    return error.message;
  }
} 