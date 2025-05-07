import { ACI } from '../../src/client';
import { FunctionDefinitionFormat } from '../../src/types/functions';
import { OpenAIFunctionDefinition, AnthropicFunctionDefinition } from '../../src/types/functions';
import dotenv from 'dotenv';
import { describe, test, expect } from '@jest/globals';

dotenv.config();

const TEST_API_KEY = process.env.TEST_API_KEY;
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';
const TEST_LINKED_ACCOUNT_OWNER_ID = process.env.TEST_LINKED_ACCOUNT_OWNER_ID;
const TEST_FUNCTION_NAME = process.env.TEST_FUNCTION_NAME;

if (!TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required');
}

const TEST_TIMEOUT = 30000; // 30 seconds timeout

describe('Functions E2E Tests', () => {
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
      invalidClient.functions.search({})
    ).rejects.toThrow('Invalid API key, api key not found');
  }, TEST_TIMEOUT);

  test.concurrent('should search functions without parameters', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    const response = await client.functions.search({});
    
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  }, TEST_TIMEOUT);

  test.concurrent('should search functions with parameters', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    const response = await client.functions.search({
      limit: 10,
      offset: 0,
      format: FunctionDefinitionFormat.OPENAI
    });
    
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  }, TEST_TIMEOUT);

  test.concurrent('should search functions with app_names filter', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    // First search for an app to get a valid app name
    const apps = await client.apps.search({ limit: 1 });
    expect(apps.length).toBeGreaterThan(0);
    
    const appName = apps[0].name;
    const response = await client.functions.search({
      app_names: [appName],
      limit: 10
    });
    
    expect(response).toBeDefined();
    expect(Array.isArray(response)).toBe(true);
  }, TEST_TIMEOUT);

  test.concurrent('should get function definition with OPENAI format', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    // First search for a function to get a valid function name
    const functions = await client.functions.search({ limit: 1 });
    expect(functions.length).toBeGreaterThan(0);
    
    const functionName = (functions[0] as any).name;
    const response = await client.functions.getDefinition(
      functionName, 
      FunctionDefinitionFormat.OPENAI
    ) as OpenAIFunctionDefinition;
    
    
    expect(response).toBeDefined();
    expect(response.type).toBe('function');
    expect(response.function).toBeDefined();
    expect(response.function.name).toBeDefined();
    expect(response.function.description).toBeDefined();
  }, TEST_TIMEOUT);

  test.concurrent('should get function definition with ANTHROPIC format', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    // First search for a function to get a valid function name
    const functions = await client.functions.search({ limit: 1 });
    expect(functions.length).toBeGreaterThan(0);
    
    const functionName = (functions[0] as any).name;
    const response = await client.functions.getDefinition(
      functionName, 
      FunctionDefinitionFormat.ANTHROPIC
    ) as AnthropicFunctionDefinition;
    
    expect(response).toBeDefined();
    expect(response.name).toBeDefined();
    expect(response.description).toBeDefined();
    expect(response.input_schema).toBeDefined();
  }, TEST_TIMEOUT);

  test.concurrent('should get function definition with default format', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    // First search for a function to get a valid function name
    const functions = await client.functions.search({ limit: 1 });
    expect(functions.length).toBeGreaterThan(0);
    
    const functionName = (functions[0] as any).name;
    const response = await client.functions.getDefinition(functionName) as OpenAIFunctionDefinition;
    
    expect(response).toBeDefined();
    expect(response.type).toBe('function');
    expect(response.function).toBeDefined();
    expect(response.function.name).toBeDefined();
    expect(response.function.description).toBeDefined();
  }, TEST_TIMEOUT);

  test.concurrent('should execute a function', async () => {
    const client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });

    const response = await client.functions.execute({
      function_name: TEST_FUNCTION_NAME || '',
      function_parameters: {
        query: {
          search_query: "AI agent"
        }
      },
      linked_account_owner_id: TEST_LINKED_ACCOUNT_OWNER_ID || ''
    });
    
    expect(response).toBeDefined();
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
  }, TEST_TIMEOUT);
}); 