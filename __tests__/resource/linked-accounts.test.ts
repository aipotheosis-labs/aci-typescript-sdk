import { ACI } from '../../src';
import { SecurityScheme } from '../../src/types/apps';
import { LinkedAccount } from '../../src/types/linked-accounts';
import dotenv from 'dotenv';
import { describe, it, expect, beforeAll } from '@jest/globals';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config();

// Get API key and test configuration
const TEST_ACI_API_KEY = process.env.TEST_ACI_API_KEY || 'test-api-key';
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';
const TEST_OWNER_ID = `test-user-${uuidv4()}`; // Test user ID to use across tests
const TEST_TIMEOUT = 30000; // 30 seconds timeout

if (!TEST_ACI_API_KEY || TEST_ACI_API_KEY === 'test-api-key') {
  console.warn('TEST_ACI_API_KEY environment variable not set or using default value');
}

describe('LinkedAccounts integration tests', () => {
  let aci: ACI;
  const OAUTH2_APP_NAME = 'GMAIL';
  const NO_AUTH_APP_NAME = 'ARXIV';
  const API_KEY_APP_NAME = 'BRAVE_SEARCH';

  beforeAll(() => {
    if (!TEST_ACI_API_KEY) {
      throw new Error('TEST_ACI_API_KEY environment variable is required');
    }

    aci = new ACI({
      apiKey: TEST_ACI_API_KEY,
      baseURL: TEST_BASE_URL,
    });
  });

  it(
    'should perform full linked accounts lifecycle',
    async () => {
      const config = await aci.appConfigurations.list({});

      // should exist no_auth app configuration
      const noAuthConfig = config.find(config => config.app_name === NO_AUTH_APP_NAME);
      expect(noAuthConfig).toBeDefined();
      expect(noAuthConfig?.security_scheme).toBe(SecurityScheme.NO_AUTH);

      // should exist api_key app configuration
      const apiKeyConfig = config.find(config => config.app_name === API_KEY_APP_NAME);
      expect(apiKeyConfig).toBeDefined();
      expect(apiKeyConfig?.security_scheme).toBe(SecurityScheme.API_KEY);

      // should exist oauth2 app configuration
      const oauth2Config = config.find(config => config.app_name === OAUTH2_APP_NAME);
      expect(oauth2Config).toBeDefined();
      expect(oauth2Config?.security_scheme).toBe(SecurityScheme.OAUTH2);

      // step 2: link accounts with different security schemes
      // Link a NO_AUTH account
      const noAuthAccount = (await aci.linkedAccounts.link({
        app_name: NO_AUTH_APP_NAME,
        linked_account_owner_id: TEST_OWNER_ID,
        security_scheme: SecurityScheme.NO_AUTH,
      })) as LinkedAccount;

      expect(noAuthAccount.app_name).toBe(NO_AUTH_APP_NAME);
      expect(noAuthAccount.linked_account_owner_id).toBe(TEST_OWNER_ID);
      expect(noAuthAccount.security_scheme).toBe(SecurityScheme.NO_AUTH);

      // Link an API_KEY account
      // Use a placeholder API key for testing
      const testApiKey = `test-api-key-${uuidv4()}`;
      const apiKeyAccount = (await aci.linkedAccounts.link({
        app_name: API_KEY_APP_NAME,
        linked_account_owner_id: TEST_OWNER_ID,
        security_scheme: SecurityScheme.API_KEY,
        api_key: testApiKey,
      })) as LinkedAccount;

      expect(apiKeyAccount.app_name).toBe(API_KEY_APP_NAME);
      expect(apiKeyAccount.linked_account_owner_id).toBe(TEST_OWNER_ID);
      expect(apiKeyAccount.security_scheme).toBe(SecurityScheme.API_KEY);

      // step 3: list all linked accounts for our test user
      const accounts = await aci.linkedAccounts.list({
        linked_account_owner_id: TEST_OWNER_ID,
      });

      const appNames = accounts.map(account => account.app_name);
      expect(appNames).toContain(API_KEY_APP_NAME);
      expect(appNames).toContain(NO_AUTH_APP_NAME);

      // step 4: get a specific linked account
      const retrievedAccount = await aci.linkedAccounts.get(apiKeyAccount.id);
      expect(retrievedAccount.id).toBe(apiKeyAccount.id);
      expect(retrievedAccount.app_name).toBe(API_KEY_APP_NAME);
      expect(retrievedAccount.linked_account_owner_id).toBe(TEST_OWNER_ID);

      // step 5: list linked accounts filtered by app_name
      const braveAccounts = await aci.linkedAccounts.list({
        app_name: API_KEY_APP_NAME,
        linked_account_owner_id: TEST_OWNER_ID,
      });

      expect(braveAccounts.length).toBe(1);
      expect(braveAccounts[0].app_name).toBe(API_KEY_APP_NAME);

      // step 6: disable a linked account
      const disabledAccount = await aci.linkedAccounts.disable(apiKeyAccount.id);
      expect(disabledAccount.enabled).toBe(false);

      // Verify the account is disabled
      const retrievedDisabledAccount = await aci.linkedAccounts.get(apiKeyAccount.id);
      expect(retrievedDisabledAccount.enabled).toBe(false);

      // step 7: enable a linked account
      const enabledAccount = await aci.linkedAccounts.enable(apiKeyAccount.id);
      expect(enabledAccount.enabled).toBe(true);

      // Verify the account is enabled
      const retrievedEnabledAccount = await aci.linkedAccounts.get(apiKeyAccount.id);
      expect(retrievedEnabledAccount.enabled).toBe(true);

      // step 8: delete all linked accounts
      const allAccounts = await aci.linkedAccounts.list({
        linked_account_owner_id: TEST_OWNER_ID,
      });

      for (const account of allAccounts) {
        await aci.linkedAccounts.delete(account.id);
      }

      // Verify accounts are deleted
      const remainingAccounts = await aci.linkedAccounts.list({
        linked_account_owner_id: TEST_OWNER_ID,
      });

      expect(remainingAccounts.length).toBe(0);
    },
    TEST_TIMEOUT
  );

  it(
    'should handle OAuth2 account linking',
    async () => {
      // should exist oauth2 app configuration
      const config = await aci.appConfigurations.list({});
      const oauth2Config = config.find(config => config.app_name === OAUTH2_APP_NAME);
      expect(oauth2Config).toBeDefined();
      expect(oauth2Config?.security_scheme).toBe(SecurityScheme.OAUTH2);

      // step 2: link a GMAIL account
      const oauth2Result = await aci.linkedAccounts.link({
        app_name: OAUTH2_APP_NAME,
        linked_account_owner_id: TEST_OWNER_ID,
        security_scheme: SecurityScheme.OAUTH2,
      });

      // The result should be a string URL for OAuth2
      expect(typeof oauth2Result).toBe('string');
    },
    TEST_TIMEOUT
  );
});
