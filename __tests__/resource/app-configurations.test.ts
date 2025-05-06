import { ACI } from '../../src/client';
import { SecurityScheme } from '../../src/types/enums';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { describe, test, expect } from '@jest/globals';

dotenv.config();

const TEST_API_KEY = process.env.TEST_API_KEY;
if (!TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required');
}

const API_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1'

describe('AppConfigurations E2E Tests', () => {
  test.concurrent('should throw error for no API key', async () => {
    expect(() => {
      new ACI({ apiKey: '' });
    }).toThrow('API key is required');
  });

  test.concurrent('should throw error for invalid API key', async () => {
    const invalidClient = new ACI({
      apiKey: 'invalid_api_key',
      baseURL: API_URL,
    });

    await expect(
      invalidClient.appConfigurations.list({})
    ).rejects.toThrow('Invalid API key, api key not found');
  });

  test.concurrent('should list app configurations', async () => {
    console.log('API_URL', API_URL);
    console.log('TEST_API_KEY', TEST_API_KEY);
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: API_URL,
    });

    const response = await client.appConfigurations.list({});
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  });
}); 