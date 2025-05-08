import { ACI } from '../../src/client';
import { ValidationError } from '../../src/exceptions';
import dotenv from 'dotenv';
import { describe, it, expect } from '@jest/globals';

// Load environment variables
dotenv.config();

// Get API key and test configuration
const TEST_ACI_API_KEY = process.env.TEST_ACI_API_KEY;
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';
const TEST_TIMEOUT = 30000; // 30 seconds timeout

if (!TEST_ACI_API_KEY) {
  throw new Error('TEST_ACI_API_KEY environment variable is required');
}

describe('Apps E2E Tests', () => {
  const client = new ACI({
    apiKey: TEST_ACI_API_KEY,
    baseURL: TEST_BASE_URL,
  });

  it.concurrent(
    'should throw error for invalid API key',
    async () => {
      const invalidClient = new ACI({
        apiKey: 'invalid_api_key',
        baseURL: TEST_BASE_URL,
      });

      await expect(invalidClient.apps.search({})).rejects.toThrow(
        'Invalid API key, api key not found'
      );
    },
    TEST_TIMEOUT
  );

  it(
    'should search apps',
    async () => {
      const response = await client.apps.search({
        limit: 10,
        offset: 0,
      });

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    },
    TEST_TIMEOUT
  );

  it(
    'should get app details',
    async () => {
      // First search for an app to get a valid app name
      const apps = await client.apps.search({ limit: 1 });
      expect(apps.length).toBeGreaterThan(0);

      const appName = apps[0].name;
      const response = await client.apps.get(appName);

      expect(response).toBeDefined();
      expect(response.name).toBe(appName);
    },
    TEST_TIMEOUT
  );
});

describe('Apps Validation Tests', () => {
  it.concurrent('should validate search params correctly', async () => {
    const client = new ACI({
      apiKey: TEST_ACI_API_KEY || 'dummy_key_for_unit_tests',
      baseURL: TEST_BASE_URL,
    });
    // Valid inputs
    await expect(
      client.apps.search({
        intent: 'test',
        limit: 10,
        offset: 0,
      })
    ).resolves.not.toThrow();

    // Invalid limit (negative)
    await expect(
      client.apps.search({
        limit: -1,
      })
    ).rejects.toThrow(ValidationError);

    // Invalid offset (negative)
    await expect(
      client.apps.search({
        offset: -1,
      })
    ).rejects.toThrow(ValidationError);
  });
});
