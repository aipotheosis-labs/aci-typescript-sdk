import { ACI } from '../../src/client';
import { FunctionDefinitionFormat } from '../../src/types/functions';
import { OpenAIFunctionDefinition, AnthropicFunctionDefinition } from '../../src/types/functions';
import { ValidationError } from '../../src/exceptions';
import dotenv from 'dotenv';
import { describe, it, expect, beforeAll } from '@jest/globals';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Get API key and test configuration
const TEST_API_KEY = process.env.TEST_API_KEY;
const TEST_BASE_URL = process.env.TEST_BASE_URL || 'https://api.aci.dev/v1';
const TEST_LINKED_ACCOUNT_OWNER_ID = process.env.TEST_LINKED_ACCOUNT_OWNER_ID;
const TEST_FUNCTION_NAME = process.env.TEST_FUNCTION_NAME || 'test_function';
const TEST_TIMEOUT = 30000; // 30 seconds timeout

if (!TEST_API_KEY) {
  throw new Error('TEST_API_KEY environment variable is required');
}

describe('Functions E2E Tests', () => {
  let client: ACI;

  beforeAll(() => {
    client = new ACI({
      apiKey: TEST_API_KEY,
      baseURL: TEST_BASE_URL,
    });
  });

  it(
    'should search functions',
    async () => {
      const response = await client.functions.search({
        limit: 10,
        offset: 0,
      });

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    },
    TEST_TIMEOUT
  );

  it(
    'should get function definition',
    async () => {
      // First search for a function to get a valid function name
      const functions = await client.functions.search({ limit: 1 });

      if (functions.length === 0) {
        console.warn('No functions found to test getDefinition');
        return;
      }

      // Find the name based on the format returned
      let functionName: string;

      if ('name' in functions[0]) {
        // BasicFunctionDefinition or AnthropicFunctionDefinition
        functionName = functions[0].name;
      } else if ('function' in functions[0]) {
        // OpenAIFunctionDefinition
        functionName = functions[0].function.name;
      } else {
        console.warn('Unexpected function format, cannot test getDefinition');
        return;
      }

      const response = await client.functions.getDefinition(functionName);
      expect(response).toBeDefined();
    },
    TEST_TIMEOUT
  );

  it('should throw error for no API key', () => {
    expect(() => {
      new ACI({ apiKey: '' });
    }).toThrow('API key is required');
  });

  it(
    'should throw error for invalid API key',
    async () => {
      const invalidClient = new ACI({
        apiKey: 'invalid_api_key',
        baseURL: TEST_BASE_URL,
      });

      await expect(invalidClient.functions.search({})).rejects.toThrow(
        'Invalid API key, api key not found'
      );
    },
    TEST_TIMEOUT
  );

  it(
    'should search functions with parameters',
    async () => {
      const response = await client.functions.search({
        limit: 10,
        offset: 0,
      });

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    },
    TEST_TIMEOUT
  );

  it(
    'should search functions with app_names filter',
    async () => {
      // First search for an app to get a valid app name
      const apps = await client.apps.search({ limit: 1 });
      expect(apps.length).toBeGreaterThan(0);

      const appName = apps[0].name;
      const response = await client.functions.search({
        app_names: [appName],
        limit: 10,
      });

      expect(response).toBeDefined();
      expect(Array.isArray(response)).toBe(true);
    },
    TEST_TIMEOUT
  );

  it(
    'should get function definition with OPENAI format',
    async () => {
      const response = (await client.functions.getDefinition(
        TEST_FUNCTION_NAME,
        FunctionDefinitionFormat.OPENAI
      )) as OpenAIFunctionDefinition;

      expect(response).toBeDefined();
      expect(response.type).toBe('function');
      expect(response.function).toBeDefined();
      expect(response.function.name).toBeDefined();
      expect(response.function.description).toBeDefined();
    },
    TEST_TIMEOUT
  );

  it(
    'should get function definition with ANTHROPIC format',
    async () => {
      const response = (await client.functions.getDefinition(
        TEST_FUNCTION_NAME,
        FunctionDefinitionFormat.ANTHROPIC
      )) as AnthropicFunctionDefinition;

      expect(response).toBeDefined();
      expect(response.name).toBeDefined();
      expect(response.description).toBeDefined();
      expect(response.input_schema).toBeDefined();
    },
    TEST_TIMEOUT
  );

  it(
    'should get function definition with default format',
    async () => {
      const response = (await client.functions.getDefinition(
        TEST_FUNCTION_NAME
      )) as OpenAIFunctionDefinition;

      expect(response).toBeDefined();
      expect(response.type).toBe('function');
      expect(response.function).toBeDefined();
      expect(response.function.name).toBeDefined();
      expect(response.function.description).toBeDefined();
    },
    TEST_TIMEOUT
  );

  it(
    'should execute a function',
    async () => {
      const response = await client.functions.execute({
        function_name: TEST_FUNCTION_NAME,
        function_parameters: {
          query: {
            search_query: 'AI agent',
          },
        },
        linked_account_owner_id: TEST_LINKED_ACCOUNT_OWNER_ID || '',
      });

      expect(response).toBeDefined();
      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
    },
    TEST_TIMEOUT
  );
});

describe('Functions Validation Tests', () => {
  let client: ACI;

  beforeAll(() => {
    client = new ACI({
      apiKey: TEST_API_KEY || 'dummy_key_for_unit_tests',
      baseURL: TEST_BASE_URL,
    });

    // Mock axios to avoid actual API calls for validation tests
    jest.spyOn(axios, 'request').mockImplementation(() => Promise.resolve({ data: [] }));
  });

  it('should validate search params correctly', async () => {
    // Valid inputs
    await expect(
      client.functions.search({
        intent: 'test',
        limit: 10,
        offset: 0,
        format: FunctionDefinitionFormat.OPENAI,
      })
    ).resolves.not.toThrow();

    // Invalid limit (negative)
    await expect(
      client.functions.search({
        limit: -1,
      })
    ).rejects.toThrow(ValidationError);

    // Invalid offset (negative)
    await expect(
      client.functions.search({
        offset: -1,
      })
    ).rejects.toThrow(ValidationError);

    // Invalid format - using type casting to test runtime validation
    await expect(
      client.functions.search({
        format: 'invalid_format' as FunctionDefinitionFormat,
      })
    ).rejects.toThrow(ValidationError);

    // Invalid app_names (not an array) - using type assertion to test runtime validation
    await expect(
      client.functions.search({
        // @ts-expect-error - Intentionally wrong type for testing validation
        app_names: 'not-an-array',
      })
    ).rejects.toThrow(ValidationError);
  });

  it('should validate getDefinition params correctly', async () => {
    // Valid inputs
    await expect(
      client.functions.getDefinition(TEST_FUNCTION_NAME, FunctionDefinitionFormat.OPENAI)
    ).resolves.not.toThrow();

    // Invalid format - using type casting to test runtime validation
    await expect(
      client.functions.getDefinition(
        TEST_FUNCTION_NAME,
        'invalid_format' as FunctionDefinitionFormat
      )
    ).rejects.toThrow(ValidationError);

    // Missing function name
    await expect(
      // @ts-expect-error - Intentionally passing null to test validation
      client.functions.getDefinition(null)
    ).rejects.toThrow(ValidationError);
  });

  it(
    'should validate execute params correctly',
    async () => {
      // Valid inputs
      await expect(
        client.functions.execute({
          function_name: TEST_FUNCTION_NAME,
          function_parameters: { query: { search_query: 'AI agent' } },
          linked_account_owner_id: TEST_LINKED_ACCOUNT_OWNER_ID || '',
        })
      ).resolves.not.toThrow();

      // Missing function name
      await expect(
        client.functions.execute({
          // @ts-expect-error - Intentionally passing null to test validation
          function_name: null,
          function_parameters: { test: { test: 'test' } },
          linked_account_owner_id: 'user123',
        })
      ).rejects.toThrow(ValidationError);

      // Missing linked_account_owner_id
      await expect(
        client.functions.execute({
          function_name: 'test_function',
          function_parameters: { test: { test: 'test' } },
          // @ts-expect-error - Intentionally passing null to test validation
          linked_account_owner_id: null,
        })
      ).rejects.toThrow(ValidationError);
    },
    TEST_TIMEOUT
  );
});
