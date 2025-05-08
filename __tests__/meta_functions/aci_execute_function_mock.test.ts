import { FunctionDefinitionFormat } from '../../src/types/functions';
import { 
  ACIExecuteFunction, 
  getAciExecuteFunctionSchema, 
  wrapFunctionArgumentsIfNotPresent 
} from '../../src/meta_functions/aci_execute_function';
import { ACI } from '../../src/client';
import MockAdapter from 'axios-mock-adapter';

describe('ACI_EXECUTE_FUNCTION Meta Function', () => {
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
      const schema = getAciExecuteFunctionSchema();
      expect(schema.name).toBe('ACI_EXECUTE_FUNCTION');
      expect(schema.description).toContain('Execute a specific retrieved function');
    });

    it('should have the required properties', () => {
      const schema = getAciExecuteFunctionSchema();
      expect(schema.parameters.properties).toHaveProperty('function_name');
      expect(schema.parameters.properties).toHaveProperty('function_arguments');
      expect(schema.parameters.required).toContain('function_name');
      expect(schema.parameters.required).toContain('function_arguments');
    });

    it('should format schema for OpenAI correctly', () => {
      const openAISchema = ACIExecuteFunction.toJsonSchema(FunctionDefinitionFormat.OPENAI);
      expect(openAISchema).toHaveProperty('type', 'function');
      expect(openAISchema).toHaveProperty('function');
      expect(openAISchema.function).toHaveProperty('name', 'ACI_EXECUTE_FUNCTION');
    });

    it('should format schema for Anthropic correctly', () => {
      const anthropicSchema = ACIExecuteFunction.toJsonSchema(FunctionDefinitionFormat.ANTHROPIC);
      expect(anthropicSchema).toHaveProperty('name', 'ACI_EXECUTE_FUNCTION');
      expect(anthropicSchema).toHaveProperty('input_schema');
    });
  });

  describe('wrapFunctionArgumentsIfNotPresent helper', () => {
    it('should wrap arguments when function_arguments is not present', () => {
      const input = {
        function_name: 'calendar_create_event',
        title: 'Meeting',
        start_time: '2023-01-01T10:00:00Z'
      };

      const result = wrapFunctionArgumentsIfNotPresent(input);
      expect(result).toEqual({
        function_name: 'calendar_create_event',
        function_arguments: {
          title: 'Meeting',
          start_time: '2023-01-01T10:00:00Z'
        }
      });
    });

    it('should not modify input if function_arguments is already present', () => {
      const input = {
        function_name: 'calendar_create_event',
        function_arguments: {
          title: 'Meeting',
          start_time: '2023-01-01T10:00:00Z'
        }
      };

      const result = wrapFunctionArgumentsIfNotPresent(input);
      expect(result).toEqual(input);
    });
  });

  describe('Integration with client', () => {
    const mockResponse = {
      success: true,
      data: { id: '123', title: 'Meeting' }
    };

    it('should call the execute endpoint with the correct parameters', async () => {
      mock.onPost('/functions/calendar_create_event/execute').reply(200, mockResponse);

      const linkedAccountOwnerId = 'user-123';
      const result = await client.handleFunctionCall({
        functionName: 'ACI_EXECUTE_FUNCTION',
        functionArguments: {
          function_name: 'calendar_create_event',
          function_arguments: {
            title: 'Team Meeting',
            start_time: '2023-01-01T10:00:00Z',
            end_time: '2023-01-01T11:00:00Z'
          }
        },
        linkedAccountOwnerId
      });

      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe('/functions/calendar_create_event/execute');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        function_input: {
          title: 'Team Meeting',
          start_time: '2023-01-01T10:00:00Z',
          end_time: '2023-01-01T11:00:00Z'
        },
        linked_account_owner_id: linkedAccountOwnerId
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle unwrapped function arguments', async () => {
      mock.onPost('/functions/calendar_create_event/execute').reply(200, mockResponse);

      const linkedAccountOwnerId = 'user-123';
      // Note: function_arguments is not wrapped
      const result = await client.handleFunctionCall({
        functionName: 'ACI_EXECUTE_FUNCTION',
        functionArguments: {
          function_name: 'calendar_create_event',
          title: 'Team Meeting',
          start_time: '2023-01-01T10:00:00Z'
        },
        linkedAccountOwnerId
      });

      expect(mock.history.post.length).toBe(1);
      expect(mock.history.post[0].url).toBe('/functions/calendar_create_event/execute');
      expect(JSON.parse(mock.history.post[0].data)).toEqual({
        function_input: {
          title: 'Team Meeting',
          start_time: '2023-01-01T10:00:00Z'
        },
        linked_account_owner_id: linkedAccountOwnerId
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle function execution errors', async () => {
      const errorResponse = {
        success: false,
        error: 'Invalid parameters'
      };

      mock.onPost('/functions/calendar_create_event/execute').reply(200, errorResponse);

      const linkedAccountOwnerId = 'user-123';
      const result = await client.handleFunctionCall({
        functionName: 'ACI_EXECUTE_FUNCTION',
        functionArguments: {
          function_name: 'calendar_create_event',
          function_arguments: { title: 'Meeting' }
        },
        linkedAccountOwnerId
      });

      expect(mock.history.post.length).toBe(1);
      expect(result).toEqual(errorResponse);
    });
  });
}); 