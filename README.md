# ACI TypeScript SDK

[![npm version](https://img.shields.io/npm/v/@aci-sdk/aci.svg)](https://www.npmjs.com/package/@aci-sdk/aci)

The official TypeScript SDK for the ACI (Agent-Computer Interface) by Aipolabs. Currently in beta, breaking changes are expected.

The ACI TypeScript SDK provides convenient access to the ACI REST API from any TypeScript/JavaScript application.

> Note: This SDK is intended for use in Node.js environments only.

## Documentation
The detailed documentation is available [here](https://aci.dev/docs).

## Installation

```bash
npm install @aci-sdk/aci
# or
yarn add @aci-sdk/aci
# or
pnpm add @aci-sdk/aci
```

## Usage
ACI platform is built with agent-first principles. Although you can call each of the APIs below any way you prefer in your application, we strongly recommend trying the [Agent-centric features](#agent-centric-features) and taking a look at the [agent examples](https://github.com/aipotheosis-labs/aci-agents/tree/main/examples) to get the most out of the platform and to enable the full potential and vision of future agentic applications.

### Client
```typescript
import { ACI } from '@aci-sdk/aci';

const client = new ACI({
  // it reads from environment variable by default so you can omit it if you set it in your environment
  apiKey: process.env.ACI_API_KEY
});
```

### Apps
#### Types
```typescript
import { AppBasic, AppDetails } from '@aci-sdk/aci';
```

#### Methods
```typescript
// search for apps, returns list of basic app data, sorted by relevance to the intent
// all parameters are optional
const apps: AppBasic[] = await client.apps.search({
  intent: "I want to search the web",
  allowed_apps_only: false, // If true, only return apps that are allowed by the agent/accessor, identified by the api key.
  include_functions: false, // If true, include functions (name and description) in the search results.
  categories: ["search"],
  limit: 10,
  offset: 0
});
```

```typescript
// get detailed information about an app, including functions supported by the app
const appDetails: AppDetails = await client.apps.get("BRAVE_SEARCH");
```

### App Configurations
#### Types
```typescript
import { AppConfiguration } from '@aci-sdk/aci';
import { SecurityScheme } from '@aci-sdk/aci';
```

#### Methods
```typescript
// Create a new app configuration
const configuration = await client.appConfigurations.create(
  "GMAIL",
  SecurityScheme.OAUTH2
);
```

```typescript
// List app configurations
// All parameters are optional
const configurations: AppConfiguration[] = await client.appConfigurations.list({
  app_names: ["GMAIL", "BRAVE_SEARCH"],  // Filter by app names
  limit: 10,  // Maximum number of results
  offset: 0   // Pagination offset
});
```

```typescript
// Get app configuration by app name
const configuration: AppConfiguration = await client.appConfigurations.get("GMAIL");
```

```typescript
// Delete an app configuration
await client.appConfigurations.delete("GMAIL");
```

### Linked Accounts
#### Types
```typescript
import { LinkedAccount } from '@aci-sdk/aci';
import { SecurityScheme } from '@aci-sdk/aci';
```

#### Methods
```typescript
// Link an account
// Returns created LinkedAccount for API_KEY and NO_AUTH security schemes
// Returns authorization URL string for OAUTH2 security scheme (you need to finish the flow in browser to create the account)
const result = await client.linkedAccounts.link({
  app_name: "BRAVE_SEARCH",                  // Name of the app to link to
  linked_account_owner_id: "user123",        // ID to identify the owner of this linked account
  security_scheme: SecurityScheme.API_KEY,   // Type of authentication
  api_key: "your-api-key"                    // Required for API_KEY security scheme
});

// OAuth2 example (returns auth URL for user to complete OAuth flow in browser)
const oauthUrl = await client.linkedAccounts.link({
  app_name: "GMAIL",
  linked_account_owner_id: "user123",
  security_scheme: SecurityScheme.OAUTH2,
  // Optional parameter to redirect to a custom URL after the OAuth2 flow (default to https://platform.aci.dev)
  // Note: the url need to be "https"
  after_oauth2_link_redirect_url: "https://<your website for your end users>"
});

// No-auth example
const account = await client.linkedAccounts.link({
  app_name: "AGENT_SECRETS_MANAGER",
  linked_account_owner_id: "user123",
  security_scheme: SecurityScheme.NO_AUTH
});
```

```typescript
// List linked accounts
// All parameters are optional
const accounts: LinkedAccount[] = await client.linkedAccounts.list({
  app_name: "BRAVE_SEARCH",                  // Filter by app name
  linked_account_owner_id: "user123"         // Filter by owner ID
});
```

```typescript
// Get a specific linked account by ID (note: linked_account_id is different from the linked_account_owner_id)
const account: LinkedAccount = await client.linkedAccounts.get(linked_account_id);
```

```typescript
// Enable a linked account (note: linked_account_id is different from the linked_account_owner_id)
const account: LinkedAccount = await client.linkedAccounts.enable(linked_account_id);
```

```typescript
// Disable a linked account (note: linked_account_id is different from the linked_account_owner_id)
const account: LinkedAccount = await client.linkedAccounts.disable(linked_account_id);
```

```typescript
// Delete a linked account (note: linked_account_id is different from the linked_account_owner_id)
await client.linkedAccounts.delete(linked_account_id);
```

### Functions
#### Types
```typescript
import { FunctionExecutionResult } from '@aci-sdk/aci';
import { FunctionDefinitionFormat } from '@aci-sdk/aci';
```

#### Methods
```typescript
// search for functions, returns list of basic function data, sorted by relevance to the intent
// all parameters are optional
const functions = await client.functions.search({
  app_names: ["BRAVE_SEARCH", "TAVILY"],
  intent: "I want to search the web",
  allowed_apps_only: false, // If true, only returns functions of apps that are allowed by the agent/accessor, identified by the api key.
  format: FunctionDefinitionFormat.OPENAI, // The format of the functions, can be OPENAI, ANTHROPIC, BASIC (name and description only)
  limit: 10,
  offset: 0
});
```

```typescript
// get function definition of a specific function, this is the schema you can feed into LLM
// the actual format is defined by the format parameter: OPENAI, ANTHROPIC, BASIC (name and description only)
const functionDefinition = await client.functions.getDefinition(
  "BRAVE_SEARCH__WEB_SEARCH",
  FunctionDefinitionFormat.OPENAI
);
```

```typescript
// execute a function with the provided parameters
const result: FunctionExecutionResult = await client.functions.execute({
  function_name: "BRAVE_SEARCH__WEB_SEARCH",
  function_parameters: { query: { q: "what is the weather in barcelona" } },
  linked_account_owner_id: "john_doe"
});

if (result.success) {
  console.log(result.data);
} else {
  console.error(result.error);
}
```

### Agent-centric features

The SDK provides a suite of features and helper functions to make it easier and more seamless to use functions in LLM powered agentic applications.
This is our vision and the recommended way of trying out the SDK.

#### Meta Functions and Unified Function Calling Handler

- A set of meta functions that can be used with LLMs as tools directly. Essentially, they are just the json schema version of some of the backend APIs of ACI.dev. They are provided so that your LLM/Agent can utilize some of the features of ACI.dev directly via function (tool) calling.

- A unified handler for function (tool) calls, which handles both the direct function calls (e.g., BRAVE_SEARCH__WEB_SEARCH) and the meta functions calls (e.g., ACISearchFunctions, ACIExecuteFunction).

```typescript
import { ACI } from '@aci-sdk/aci';
import { FunctionDefinitionFormat } from '@aci-sdk/aci';

const client = new ACI({
  apiKey: process.env.ACI_API_KEY
});

// Handle a function call from an LLM
const searchResults = await client.handleFunctionCall({
  functionName: 'ACI_SEARCH_FUNCTIONS',
  functionArguments: {
    intent: "I want to star a GitHub repository",
    limit: 10
  },
  linkedAccountOwnerId: 'user123',
  allowedOnly: false,
  format: FunctionDefinitionFormat.OPENAI_RESPONSES
});

// The results can be used to execute the found function
if (searchResults.length > 0) {
  const executeResult = await client.handleFunctionCall({
    functionName: 'ACI_EXECUTE_FUNCTION',
    functionArguments: {
      function_name: searchResults[0].function.name,
      function_arguments: {
        // function specific arguments
      }
    },
    linkedAccountOwnerId: 'user123',
    format: FunctionDefinitionFormat.OPENAI_RESPONSES
  });
}
```

Please see [agent examples](https://github.com/aipotheosis-labs/aci-agents?tab=readme-ov-file#2-agent-with-dynamic-tool-discovery-and-execution) for more advanced and complete examples.

## License

MIT

## Contributing

We welcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for details.
