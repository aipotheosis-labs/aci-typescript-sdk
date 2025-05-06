import { ACI } from '../../src/client';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { describe, test, expect } from '@jest/globals';

dotenv.config();

const TEST_API_KEY = process.env.TEST_API_KEY;
if (!TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required');
}

const API_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1'

describe('Apps E2E Tests', () => {
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
      invalidClient.apps.search({})
    ).rejects.toThrow('Invalid API key, api key not found');
  });

  test.concurrent('should search apps', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: API_URL,
    });

    const response = await client.apps.search({
      limit: 10,
      offset: 0
    });
    
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  });

  test.concurrent('should get app details', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: API_URL,
    });

    // First search for an app to get a valid app name
    const apps = await client.apps.search({ limit: 1 });
    expect(apps.length).toBeGreaterThan(0);
    
    const appName = apps[0].name;
    const response = await client.apps.get(appName);
    
    expect(response).toBeDefined();
    expect(response.name).toBe(appName);
  });
}); 