import OpenAI from 'openai';
import { ACI } from '../src/client';
import { ACISearchFunctions, ACIExecuteFunction } from '../src/meta_functions';
import { FunctionDefinitionFormat } from '../src/types/functions';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  // Initialize clients
  const aciClient = new ACI({
    apiKey: process.env.ACI_API_KEY as string,
  });

  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  // Get function schemas in OpenAI format
  const aciSearchFunctionsSchema = ACISearchFunctions.toJsonSchema(
    FunctionDefinitionFormat.OPENAI_RESPONSES
  );

  const aciExecuteFunctionSchema = ACIExecuteFunction.toJsonSchema(
    FunctionDefinitionFormat.OPENAI_RESPONSES
  );

  const systemPrompt = `You are a helpful assistant with access to an unlimited number of tools via some meta functions: 
    - ACI_SEARCH_FUNCTIONS, 
    - and ACI_EXECUTE_FUNCTION. 
    You can use ACI_SEARCH_FUNCTIONS to find relevant functions across all apps. 
    Try to limit the number of results per request to 10. 
    Once you have identified the function you need to use, 
    you can use ACI_EXECUTE_FUNCTION to execute the function provided you have the correct input arguments.
`;

  const userMessage = 'Can you star aipotheosis-labs/aci github repo?';

  // Step 1: Search for relevant functions
  const searchResponse = await openaiClient.responses.create({
    model: 'gpt-4',
    input: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ],
    tools: [aciSearchFunctionsSchema, aciExecuteFunctionSchema] as any,
  });

  // Find the first function call in the response
  const searchToolCall = searchResponse.output.find((item: any) => item.type === 'function_call');

  if (!searchToolCall || searchToolCall.type !== 'function_call') {
    throw new Error('No tool call returned from OpenAI');
  }

  // Step 2: Handle the ACI search function call
  const searchArguments = JSON.parse(searchToolCall.arguments);
  const searchResults = await aciClient.handleFunctionCall({
    functionName: searchToolCall.name,
    functionArguments: searchArguments,
    linkedAccountOwnerId: 'your-user-id', // Replace with actual user ID
    allowedOnly: false,
    format: FunctionDefinitionFormat.OPENAI_RESPONSES,
  });

  // Step 3: Execute the found function
  const executeResponse = await openaiClient.responses.create({
    model: 'gpt-4',
    input: [
      {
        role: 'system',
        content: systemPrompt,
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
  const executeToolCall = executeResponse.output.find((item: any) => item.type === 'function_call');

  if (!executeToolCall || executeToolCall.type !== 'function_call') {
    throw new Error('No execution tool call returned from OpenAI');
  }

  // Step 4: Execute the function
  const executeArguments = JSON.parse(executeToolCall.arguments);
  const executionResult = await aciClient.handleFunctionCall({
    functionName: executeToolCall.name,
    functionArguments: executeArguments,
    linkedAccountOwnerId: process.env.LINKED_ACCOUNT_OWNER_ID as string,
    format: FunctionDefinitionFormat.OPENAI_RESPONSES,
  });

  console.log('Execution result:', executionResult);
}

// Run the example
main().catch(console.error);
