import { AxiosError } from 'axios';
import { APIResource } from './base';
import { LinkedAccount } from '../types/linked-accounts';
import { SecurityScheme } from '../types/enums';

export class LinkedAccountsResource extends APIResource {
  async link(params: {
    app_name: string;
    linked_account_owner_id: string;
    security_scheme: SecurityScheme;
    api_key?: string;
  }): Promise<LinkedAccount | string> {
    try {
      const response = await this.client.post('/linked-accounts', params);
      return this.handleResponse<LinkedAccount | string>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async list(params: {
    app_name?: string;
    linked_account_owner_id?: string;
  }): Promise<LinkedAccount[]> {
    try {
      const response = await this.client.get('/linked-accounts', { params });
      return this.handleResponse<LinkedAccount[]>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async get(linkedAccountId: string): Promise<LinkedAccount> {
    try {
      const response = await this.client.get(`/linked-accounts/${linkedAccountId}`);
      return this.handleResponse<LinkedAccount>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async enable(linkedAccountId: string): Promise<LinkedAccount> {
    try {
      const response = await this.client.post(`/linked-accounts/${linkedAccountId}/enable`);
      return this.handleResponse<LinkedAccount>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async disable(linkedAccountId: string): Promise<LinkedAccount> {
    try {
      const response = await this.client.post(`/linked-accounts/${linkedAccountId}/disable`);
      return this.handleResponse<LinkedAccount>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  async delete(linkedAccountId: string): Promise<void> {
    try {
      await this.client.delete(`/linked-accounts/${linkedAccountId}`);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
} 