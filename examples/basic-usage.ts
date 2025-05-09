import { ACI, SecurityScheme, FunctionDefinitionFormat } from '@aci-sdk/aci';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  // Initialize the ACI client
  const apiKey = process.env.ACI_API_KEY;
  if (!apiKey) {
    throw new Error('ACI_API_KEY environment variable is not set');
  }

  const client = new ACI({
    apiKey,
  });

  try {
    // Example 1: Search for apps
    console.log('Searching for apps...');
    const apps = await client.apps.search({
      intent: 'I want to search the web',
      allowed_apps_only: false,
      include_functions: true,
      limit: 5,
    });
    console.log('Found apps:', apps);

    // Example 2: Get app details
    if (apps.length > 0) {
      console.log('\nGetting app details...');
      const appDetails = await client.apps.get(apps[0].name);
      console.log('App details:', appDetails);
    }

    // Example 3: Create an app configuration
    console.log('\nCreating app configuration...');
    try {
      const configuration = await client.appConfigurations.create({
        app_name: 'BRAVE_SEARCH',
        security_scheme: SecurityScheme.API_KEY,
        all_functions_enabled: true,
      });
      console.log('Created configuration:', configuration);
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        console.log('App configuration already exists, getting existing configuration...');
        const existingConfig = await client.appConfigurations.get('BRAVE_SEARCH');
        console.log('Existing configuration:', existingConfig);
      } else {
        throw error;
      }
    }

    // Example 4: Link an account
    console.log('\nLinking account...');
    try {
      const linkedAccount = await client.linkedAccounts.link({
        app_name: 'BRAVE_SEARCH',
        linked_account_owner_id: 'example_user',
        security_scheme: SecurityScheme.API_KEY,
        api_key: 'your-api-key-here',
      });
      console.log('Linked account:', linkedAccount);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Linked account already exists')) {
        console.log('Linked account already exists, getting existing account...');
        const accounts = await client.linkedAccounts.list({
          app_name: 'BRAVE_SEARCH',
          linked_account_owner_id: 'example_user',
        });
        if (accounts.length > 0) {
          console.log('Existing linked account:', accounts[0]);
        } else {
          console.log('No existing linked account found');
        }
      } else {
        throw error;
      }
    }

    // Example 5: Search for functions
    console.log('\nSearching for functions...');
    const functions = await client.functions.search({
      app_names: ['BRAVE_SEARCH'],
      intent: 'I want to search the web',
      format: FunctionDefinitionFormat.OPENAI,
    });
    console.log('Found functions:', functions);

    // Example 6: Execute a function
    if (functions.length > 0) {
      console.log('\nExecuting function...');
      try {
        const result = await client.functions.execute({
          function_name: 'BRAVE_SEARCH__WEB_SEARCH',
          function_parameters: { query: { q: 'what is the weather in barcelona' } },
          linked_account_owner_id: 'example_user',
        });
        console.log('Function execution result:', result);
      } catch (error) {
        if (error instanceof Error && error.message.includes('App not allowed for this agent')) {
          console.log(
            'Function execution failed: App is not allowed for this agent. Please check app permissions.'
          );
        } else {
          throw error;
        }
      }
    }

    // Example 7: Using the function search with OPENAI_RESPONSES format
    console.log('\nSearching functions with OPENAI_RESPONSES format...');
    const searchResults = await client.functions.search({
      intent: 'I want to search the web',
      allowed_apps_only: false,
      limit: 5,
      format: FunctionDefinitionFormat.OPENAI_RESPONSES,
    });
    console.log('Search results:', searchResults);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
main().catch(console.error);
