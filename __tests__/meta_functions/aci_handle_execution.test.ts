import OpenAI from 'openai';
import { ACI } from '../../src/client';
import { ACISearchFunctions, ACIExecuteFunction } from '../../src/meta_functions';
import { FunctionDefinitionFormat } from '../../src/types/functions';
// load .env.local
import dotenv from 'dotenv';
dotenv.config();

// Skip all tests if required API keys are not provided
describe('AI Integration Tests', () => {
  let aciClient: ACI;
  let openaiClient: OpenAI;

  beforeAll(() => {
    // Create a real API clients using environment variables
    aciClient = new ACI({
      apiKey: process.env.TEST_ACI_API_KEY as string,
    });

    openaiClient = new OpenAI({
      apiKey: process.env.TEST_OPENAI_API_KEY as string,
    });
  });

  // Helper to extract the first function_call from OpenAI output
  function getFirstFunctionCall(output: any[]) {
    return output.find(item => item.type === 'function_call');
  }

  it('completes a full AI workflow: search and execute GitHub star repo', async () => {
    // Get the function schemas in OpenAI format
    const aciSearchFunctionsSchema = ACISearchFunctions.toJsonSchema(
      FunctionDefinitionFormat.OPENAI_RESPONSES
    );

    const aciExecuteFunctionSchema = ACIExecuteFunction.toJsonSchema(
      FunctionDefinitionFormat.OPENAI_RESPONSES
    );

    // Step 1: Initial user query and function search
    const userMessage = 'Can you star aipotheosis-labs/aci github repo?';

    // Using as any to bypass TypeScript errors for the test
    const searchResponse = await openaiClient.responses.create({
      model: 'gpt-4o',
      input: userMessage,
      tools: [aciSearchFunctionsSchema, aciExecuteFunctionSchema] as any,
    });

    const searchToolCall = getFirstFunctionCall(searchResponse.output);
    expect(searchToolCall).toBeDefined();

    if (!searchToolCall || searchToolCall.type !== 'function_call') {
      throw new Error('No tool call returned from OpenAI');
    }

    // Verify it's calling the search function
    expect(searchToolCall.name).toBe('ACI_SEARCH_FUNCTIONS');

    // Step 2: Handle the ACI search function call
    const searchArguments = JSON.parse(searchToolCall.arguments);
    const searchResults = await aciClient.handleFunctionCall({
      functionName: searchToolCall.name,
      functionArguments: searchArguments,
      linkedAccountOwnerId: 'test-user-id',
      allowedAppsOnly: false,
      format: FunctionDefinitionFormat.OPENAI_RESPONSES,
    });

    // Verify we found the GitHub star repository function
    expect(Array.isArray(searchResults)).toBe(true);
    expect(searchResults.length).toBeGreaterThan(0);

    // Find the GitHub star repository function
    const githubStarFunction = searchResults.find(
      (func: any) =>
        func.function?.name === 'GITHUB__STAR_REPOSITORY' || func.name === 'GITHUB__STAR_REPOSITORY'
    );
    expect(githubStarFunction).toBeDefined();

    // Second OpenAI call to trigger execution
    const executeResponse = await openaiClient.responses.create({
      model: 'gpt-4o',
      input: [
        {
          role: 'system',
          content:
            'You are a helpful assistant with access to an unlimited number of tools via some meta functions: ' +
            'ACI_SEARCH_FUNCTIONS, and ACI_EXECUTE_FUNCTION. ' +
            'You can use ACI_SEARCH_FUNCTIONS to find relevant functions across all apps. Try to limit the number of results per request to 1. ' +
            'Once you have identified the function you need to use, you can use ACI_EXECUTE_FUNCTION to execute the function provided you have the correct input arguments.' +
            'When you useing ACI_SEARCH_FUNCTIONS, the limit parameter is 10 typically',
        },
        {
          role: 'user',
          content: userMessage,
        },
        {
          ...searchToolCall,
        },
        {
          type: 'function_call_output',
          call_id: searchToolCall.call_id,
          output: JSON.stringify(searchResults),
        },
      ],
      tools: [aciSearchFunctionsSchema, aciExecuteFunctionSchema] as any,
    } as any);

    // Extract the execution tool call
    const executeToolCall = getFirstFunctionCall(executeResponse.output);
    expect(executeToolCall).toBeDefined();

    if (!executeToolCall || executeToolCall.type !== 'function_call') {
      throw new Error('No execution tool call returned from OpenAI');
    }

    // Verify it's calling the execute function
    expect(executeToolCall.name).toBe('ACI_EXECUTE_FUNCTION');

    // Step 4: Check the execution parameters
    const executeArguments = JSON.parse(executeToolCall.arguments);
    expect(executeArguments.function_name).toBe('GITHUB__STAR_REPOSITORY');
    expect(executeArguments.function_arguments.path.owner).toBe('aipotheosis-labs');
    expect(executeArguments.function_arguments.path.repo).toBe('aci');

    // Note: We're not actually executing the function as it would require
    // real GitHub credentials, but we've verified the LLM generates the correct parameters
  }, 60000); // Longer timeout for this complex test
});
