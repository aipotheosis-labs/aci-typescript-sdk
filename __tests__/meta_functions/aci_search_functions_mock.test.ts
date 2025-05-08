import { FunctionDefinitionFormat } from '../../src/types/functions';
import { ACISearchFunctions, getAciSearchFunctionsSchema } from '../../src/meta_functions/aci_search_functions';
import { ACI } from '../../src/client';
import MockAdapter from 'axios-mock-adapter';

describe('ACI_SEARCH_FUNCTIONS Meta Function', () => {
  let client: ACI;
  let mock: MockAdapter;
  const mockApiKey = 'test-api-key';

  beforeEach(() => {
    client = new ACI({ apiKey: mockApiKey });
    mock = new MockAdapter(client['client']);
  });

  afterEach(() => {
    mock.reset();
  });

  describe('Schema', () => {
    it('should have the correct name and description', () => {
      const schema = getAciSearchFunctionsSchema();
      expect(schema.name).toBe('ACI_SEARCH_FUNCTIONS');
      expect(schema.description).toContain('This function allows you to find relevant executable functions');
    });

    it('should have the required properties', () => {
      const schema = getAciSearchFunctionsSchema();
      expect(schema.parameters.properties).toHaveProperty('intent');
      expect(schema.parameters.properties).toHaveProperty('limit');
      expect(schema.parameters.properties).toHaveProperty('offset');
    });

    it('should format schema for OpenAI correctly', () => {
      const openAISchema = ACISearchFunctions.toJsonSchema(FunctionDefinitionFormat.OPENAI);
      expect(openAISchema).toHaveProperty('type', 'function');
      expect(openAISchema).toHaveProperty('function');
      expect(openAISchema.function).toHaveProperty('name', 'ACI_SEARCH_FUNCTIONS');
    });

    it('should format schema for Anthropic correctly', () => {
      const anthropicSchema = ACISearchFunctions.toJsonSchema(FunctionDefinitionFormat.ANTHROPIC);
      expect(anthropicSchema).toHaveProperty('name', 'ACI_SEARCH_FUNCTIONS');
      expect(anthropicSchema).toHaveProperty('input_schema');
    });
  });

  describe('Integration with client', () => {
    const mockResponse = [
      {
        name: 'test_function',
        description: 'A test function',
        parameters: { type: 'object', properties: {} }
      }
    ];

    it('should call the search endpoint with the correct parameters', async () => {
      mock.onGet('/functions/search').reply(200, mockResponse);

      const linkedAccountOwnerId = 'user-123';
      const result = await client.handleFunctionCall({
        functionName: 'ACI_SEARCH_FUNCTIONS',
        functionArguments: { intent: 'test search', limit: 10, offset: 0 },
        linkedAccountOwnerId,
        format: FunctionDefinitionFormat.OPENAI
      });

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].url).toBe('/functions/search');
      expect(mock.history.get[0].params).toEqual({
        intent: 'test search',
        limit: 10,
        offset: 0,
        allowed_apps_only: undefined,
        format: 'openai'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle search with only intent parameter', async () => {
      mock.onGet('/functions/search').reply(200, mockResponse);

      const linkedAccountOwnerId = 'user-123';
      const result = await client.handleFunctionCall({
        functionName: 'ACI_SEARCH_FUNCTIONS',
        functionArguments: { intent: 'find calendar functions' },
        linkedAccountOwnerId
      });

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].params).toHaveProperty('intent', 'find calendar functions');
      expect(result).toEqual(mockResponse);
    });

    it('should pass along the allowed_apps_only flag', async () => {
      mock.onGet('/functions/search').reply(200, mockResponse);

      const linkedAccountOwnerId = 'user-123';
      const result = await client.handleFunctionCall({
        functionName: 'ACI_SEARCH_FUNCTIONS',
        functionArguments: { intent: 'test search' },
        linkedAccountOwnerId,
        allowedAppsOnly: true
      });

      expect(mock.history.get.length).toBe(1);
      expect(mock.history.get[0].params).toHaveProperty('allowed_apps_only', true);
      expect(result).toEqual(mockResponse);
    });
  });
}); 