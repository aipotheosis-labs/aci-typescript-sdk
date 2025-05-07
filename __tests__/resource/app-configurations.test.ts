import { ACI } from '../../src/client';
import dotenv from 'dotenv';
import { describe, test, expect } from '@jest/globals';
import { SecurityScheme } from '../../src/types/apps';

dotenv.config();

const TEST_API_KEY = process.env.TEST_API_KEY;
if (!TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required');
}

const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';
const TEST_APP_NAME = "BRAVE_SEARCH"

describe('AppConfigurations E2E Tests', () => {
  test('should throw error for no API key', async () => {
    expect(() => {
      new ACI({ apiKey: '' });
    }).toThrow('API key is required');
  });

  test('should throw error for invalid API key', async () => {
    const invalidClient = new ACI({
      apiKey: 'invalid_api_key',
      baseURL: TEST_BASE_URL,
    });

    await expect(
      invalidClient.appConfigurations.list({})
    ).rejects.toThrow('Invalid API key, api key not found');
  });

  test('should list app configurations', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    const response = await client.appConfigurations.list({});
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  });

  test('should create, get, and delete app configuration', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });
    
    // Create app configuration
    const createdConfig = await client.appConfigurations.create(
      TEST_APP_NAME,
      SecurityScheme.API_KEY
    );
    expect(createdConfig).toBeDefined();
    expect(createdConfig.app_name).toBe(TEST_APP_NAME);
    expect(createdConfig.security_scheme).toBe(SecurityScheme.API_KEY);
    expect(createdConfig.created_at).toBeDefined();
    expect(createdConfig.updated_at).toBeDefined();

    // Get app configuration
    const retrievedConfig = await client.appConfigurations.get(TEST_APP_NAME);
    expect(retrievedConfig).toBeDefined();
    expect(retrievedConfig.app_name).toBe(TEST_APP_NAME);
    expect(retrievedConfig.security_scheme).toBe(SecurityScheme.API_KEY);

    // Delete app configuration
    await client.appConfigurations.delete(TEST_APP_NAME);
    
    // Verify deletion
    await expect(
      client.appConfigurations.get(TEST_APP_NAME)
    ).rejects.toThrow();

    // create a new app configuration
    const newConfig = await client.appConfigurations.create(
      TEST_APP_NAME,
      SecurityScheme.API_KEY
    );
    expect(newConfig).toBeDefined();
    expect(newConfig.app_name).toBe(TEST_APP_NAME);
  });

  test('should filter app configurations by app names', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    const allConfigs = await client.appConfigurations.list({});
    
    if (allConfigs.length > 0) {
      const firstAppName = allConfigs[0].app_name;
      const filteredConfigs = await client.appConfigurations.list({
        app_names: [firstAppName]
      });
      
      expect(filteredConfigs).toBeDefined();
      expect(Array.isArray(filteredConfigs)).toBe(true);
      expect(filteredConfigs.length).toBeGreaterThanOrEqual(1);
      expect(filteredConfigs[0].app_name).toBe(firstAppName);
    } else {
      // Skip this test if no configurations exist
      console.log('Skipping filter test as no app configurations exist');
    }
  });
}); 