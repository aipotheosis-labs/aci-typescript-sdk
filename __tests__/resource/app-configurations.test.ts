import { ACI } from '../../src/client';
import dotenv from 'dotenv';
import { describe, test, expect } from '@jest/globals';

dotenv.config();

const TEST_API_KEY = process.env.TEST_API_KEY;
if (!TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required');
}

const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';

describe('AppConfigurations E2E Tests', () => {
  test.concurrent('should throw error for no API key', async () => {
    expect(() => {
      new ACI({ apiKey: '' });
    }).toThrow('API key is required');
  });

  test.concurrent('should throw error for invalid API key', async () => {
    const invalidClient = new ACI({
      apiKey: 'invalid_api_key',
      baseURL: TEST_BASE_URL,
    });

    await expect(
      invalidClient.appConfigurations.list({})
    ).rejects.toThrow('Invalid API key, api key not found');
  });

  test.concurrent('should list app configurations', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    const response = await client.appConfigurations.list({});
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  });
}); 