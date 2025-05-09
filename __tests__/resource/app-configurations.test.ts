import { ACI } from '../../src/client';
import { SecurityScheme } from '../../src/types/apps';
import dotenv from 'dotenv';
import { describe, it, expect } from '@jest/globals';

// Load environment variables
dotenv.config();

// Get API key and test configuration
const TEST_ACI_API_KEY = process.env.TEST_ACI_API_KEY;
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';
const TEST_APP_NAME = 'AIRTABLE';
const TEST_TIMEOUT = 30000; // 30 seconds timeout

if (!TEST_ACI_API_KEY) {
  throw new Error('TEST_ACI_API_KEY environment variable is required');
}

describe('AppConfigurations E2E Tests', () => {
  const client = new ACI({
    apiKey: TEST_ACI_API_KEY,
    baseURL: TEST_BASE_URL,
  });

  it.concurrent('should throw error for no API key', async () => {
    expect(() => {
      new ACI({ apiKey: '' });
    }).toThrow('API key is required');
  });

  it.concurrent(
    'should throw error for invalid API key',
    async () => {
      const invalidClient = new ACI({
        apiKey: 'invalid_api_key',
        baseURL: TEST_BASE_URL,
      });

      await expect(invalidClient.appConfigurations.list({})).rejects.toThrow(
        'Invalid API key, api key not found'
      );
    },
    TEST_TIMEOUT
  );

  it.concurrent(
    'should list app configurations',
    async () => {
      const response = await client.appConfigurations.list({});
      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    },
    TEST_TIMEOUT
  );

  it(
    'should create, get, and delete app configuration',
    async () => {
      // Clean up: delete app configuration if it exists
      const existingConfig = await client.appConfigurations.get(TEST_APP_NAME);
      if (existingConfig) {
        await client.appConfigurations.delete(TEST_APP_NAME);
      }

      // Create a new app configuration
      const newConfig = await client.appConfigurations.create({
        app_name: TEST_APP_NAME,
        security_scheme: SecurityScheme.API_KEY,
      });
      expect(newConfig).toBeDefined();
      expect(newConfig.app_name).toBe(TEST_APP_NAME);

      // Get app configuration
      const retrievedConfig = await client.appConfigurations.get(TEST_APP_NAME);
      expect(retrievedConfig).not.toBeNull();
      expect(retrievedConfig?.app_name).toBe(TEST_APP_NAME);
      expect(retrievedConfig?.security_scheme).toBe(SecurityScheme.API_KEY);

      // Delete app configuration
      await client.appConfigurations.delete(TEST_APP_NAME);

      // Verify deletion
      const deletedConfig = await client.appConfigurations.get(TEST_APP_NAME);
      expect(deletedConfig).toBeNull();

      // Create again to leave it in a known state
      const recreatedConfig = await client.appConfigurations.create({
        app_name: TEST_APP_NAME,
        security_scheme: SecurityScheme.API_KEY,
      });
      expect(recreatedConfig).toBeDefined();
      expect(recreatedConfig.app_name).toBe(TEST_APP_NAME);
    },
    TEST_TIMEOUT
  );
});
