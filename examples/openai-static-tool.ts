import OpenAI from 'openai';
import { ACI } from '@aci-sdk/aci';
import { FunctionDefinitionFormat } from '@aci-sdk/aci';
import dotenv from 'dotenv';
import { OpenAIResponsesFunctionDefinition } from '@aci-sdk/aci';

// Load environment variables
dotenv.config();

const LINKED_ACCOUNT_OWNER_ID = process.env.LINKED_ACCOUNT_OWNER_ID;
if (!LINKED_ACCOUNT_OWNER_ID) {
  throw new Error('LINKED_ACCOUNT_OWNER_ID is not set');
}

async function main() {
  // Initialize clients
  const aciClient = new ACI({ 
    apiKey: process.env.ACI_API_KEY as string
  });
  
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY as string,
  });

  // Get Brave Search function definition in OpenAI format
  const braveSearchFunctionDefinition = await aciClient.functions.getDefinition(
    'BRAVE_SEARCH__WEB_SEARCH', 
    FunctionDefinitionFormat.OPENAI_RESPONSES
  ) as OpenAIResponsesFunctionDefinition

  console.log('Brave search function definition:');
  console.log(braveSearchFunctionDefinition);

  // Convert function definition to OpenAI format
  const openaiTool = braveSearchFunctionDefinition as any;

  // Create chat completion with OpenAI
  const response = await openaiClient.responses.create({
    model: 'gpt-4o',
    input: [
      {
        role: 'system',
        content: 'You are a helpful assistant with access to a variety of tools.',
      },
      {
        role: 'user',
        content: 'What is aipolabs ACI?',
      },
    ],
    tools: [openaiTool],
    tool_choice: 'required', // force the model to generate a tool call for demo purposes
  });

  const toolCall = response.output[0] as any;

  if (toolCall) {
    console.log('Tool call:', toolCall);

    // Submit the selected function and its arguments to ACI backend for execution
    const result1 = await aciClient.handleFunctionCall({
      functionName: toolCall.name,
      functionArguments: JSON.parse(toolCall.arguments),
      linkedAccountOwnerId: LINKED_ACCOUNT_OWNER_ID,
      allowedAppsOnly: true,
      format: FunctionDefinitionFormat.OPENAI_RESPONSES
    });

    console.log('ACI Function Call Result1:');
    console.log(JSON.stringify(result1, null, 2));

    
    // Alternatively, because this is a direct function execution you can use:
    // you just need one way to execute the function
    // const result2 = await aciClient.functions.execute({
    //   function_name: toolCall.name,
    //   function_parameters: JSON.parse(toolCall.arguments),
    //   linked_account_owner_id: LINKED_ACCOUNT_OWNER_ID as string
    // });
    

    // console.log('ACI Function Call Result2:');
    // console.log(JSON.stringify(result2, null, 2));
  }
}

// Run the example
main().catch(console.error); 