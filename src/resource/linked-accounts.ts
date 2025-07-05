import { AxiosError } from 'axios';
import { APIResource } from './base';
import { LinkedAccount } from '../types/linked-accounts';
import { SecurityScheme } from '../types/apps';
import { ValidationError } from '../exceptions';
import { LinkedAccountsSchema } from '../schemas';
import { DEFAULT_AFTER_OAUTH2_FLOW_REDIRECT_URL } from '../constants';

export class LinkedAccountsResource extends APIResource {
  /**
   * Link an account with the specified authentication type.
   *
   * @param params.app_name Name of the app to link account for, e.g., "GMAIL"
   * @param params.linked_account_owner_id ID of the owner of the linked account, e.g., "johndoe"
   * @param params.security_scheme The security scheme to use for the linked account.
   * @param params.api_key API key for authentication (required when security_scheme is API_KEY).
   * @param params.after_oauth2_link_redirect_url Only applicable when security_scheme is OAUTH2. The URL to redirect to after OAuth2 link.
   * @returns If security_scheme is API_KEY or NO_AUTH, returns the linked account. If security_scheme is OAUTH2, returns the OAuth2 authorization URL.
   * @throws ValidationError If required parameters for the specified security scheme are missing.
   */
  async link(params: {
    app_name: string;
    linked_account_owner_id: string;
    security_scheme: SecurityScheme;
    api_key?: string;
    after_oauth2_link_redirect_url?: string;
  }): Promise<LinkedAccount | string> {
    try {
      if (params.security_scheme === SecurityScheme.API_KEY && !params.api_key) {
        throw new ValidationError('api_key parameter is required when security_scheme is API_KEY');
      }

      const validatedParams = this.validateInput(LinkedAccountsSchema.link, params);

      if (params.security_scheme === SecurityScheme.API_KEY) {
        const response = await this.client.post('/linked-accounts/api-key', validatedParams);
        return this.handleResponse<LinkedAccount>(response);
      } else if (params.security_scheme === SecurityScheme.NO_AUTH) {
        const response = await this.client.post('/linked-accounts/no-auth', validatedParams);
        return this.handleResponse<LinkedAccount>(response);
      } else if (params.security_scheme === SecurityScheme.OAUTH2) {
        const oauth2Params = {
          ...validatedParams,
          after_oauth2_link_redirect_url:
            params.after_oauth2_link_redirect_url || DEFAULT_AFTER_OAUTH2_FLOW_REDIRECT_URL,
        };
        const response = await this.client.get('/linked-accounts/oauth2', {
          params: oauth2Params,
        });
        const responseData = this.handleResponse<{ url: string }>(response);
        return responseData.url;
      }

      // Fallback to original implementation for backward compatibility
      const response = await this.client.post('/linked-accounts', validatedParams);
      return this.handleResponse<LinkedAccount | string>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * List linked accounts.
   *
   * @param params.app_name Optional name of the app to filter linked accounts by, e.g., "GMAIL"
   * @param params.linked_account_owner_id Optional ID of the owner of the linked account to filter by, e.g., "johndoe"
   * @returns A list of linked accounts.
   */
  async list(params: {
    app_name?: string;
    linked_account_owner_id?: string;
  }): Promise<LinkedAccount[]> {
    try {
      const validatedParams = this.validateInput(LinkedAccountsSchema.list, params);
      const response = await this.client.get('/linked-accounts', {
        params: validatedParams,
      });
      return this.handleResponse<LinkedAccount[]>(response);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Retrieve a specific linked account.
   *
   * @param linkedAccountId ID of the linked account to retrieve.
   * @returns The linked account with security credentials if oauth2
   */
  async get(linkedAccountId: string): Promise<LinkedAccount> {
    try {
      const response = await this.client.get(`/linked-accounts/${linkedAccountId}`);
      const linkedAccount = this.handleResponse<LinkedAccount>(response);
      // if not oauth2 set security_credentials to undefined
      if (linkedAccount.security_scheme !== SecurityScheme.OAUTH2) {
        linkedAccount.security_credentials = undefined;
      }
      return linkedAccount;
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Enable a linked account.
   *
   * @param linkedAccountId ID of the linked account to enable.
   * @returns The updated linked account.
   */
  async enable(linkedAccountId: string): Promise<LinkedAccount> {
    try {
      return this._update(linkedAccountId, true);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Disable a linked account.
   *
   * @param linkedAccountId ID of the linked account to disable.
   * @returns The updated linked account.
   */
  async disable(linkedAccountId: string): Promise<LinkedAccount> {
    try {
      return this._update(linkedAccountId, false);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Update a linked account.
   *
   * @param linkedAccountId ID of the linked account to update.
   * @param enabled Whether to enable or disable the linked account.
   * @returns The updated linked account.
   * @private
   */
  private async _update(linkedAccountId: string, enabled: boolean): Promise<LinkedAccount> {
    try {
      const response = await this.client.patch(`/linked-accounts/${linkedAccountId}`, { enabled });
      return this.handleResponse<LinkedAccount>(response);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }

  /**
   * Delete a linked account.
   *
   * @param linkedAccountId ID of the linked account to delete.
   */
  async delete(linkedAccountId: string): Promise<void> {
    try {
      await this.client.delete(`/linked-accounts/${linkedAccountId}`);
    } catch (error) {
      return this.handleError(error as AxiosError);
    }
  }
}
