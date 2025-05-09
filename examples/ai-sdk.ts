import { generateText, tool } from 'ai';
import { openai } from '@ai-sdk/openai';
import { jsonSchema } from 'ai';
import dotenv from 'dotenv';
import { FunctionDefinitionFormat } from '@aci-sdk/aci';
import { ACI } from '@aci-sdk/aci';
import { OpenAIResponsesFunctionDefinition } from '@aci-sdk/aci';

dotenv.config();

async function main() {
    const aciClient = new ACI({ 
        apiKey: process.env.ACI_API_KEY as string
    });
    
    const braveSearchFunctionDefinition = await aciClient.functions.getDefinition(
        'BRAVE_SEARCH__WEB_SEARCH', 
        FunctionDefinitionFormat.OPENAI_RESPONSES
    ) as OpenAIResponsesFunctionDefinition
  
    const result = await generateText({
        model: openai('gpt-4o'),
        tools: {
            braveSearch: tool({
                description: 'Search the web for information',
                parameters: jsonSchema(braveSearchFunctionDefinition.parameters),
            }),
        },
        prompt: 'What is the weather in San Francisco?',
    });

    for (const toolCall of result.toolCalls) {
        console.log(JSON.stringify(toolCall, null, 2));
    }
}

main().catch(console.error);
