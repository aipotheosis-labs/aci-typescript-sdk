# ACI TypeScript SDK

The official TypeScript SDK for the ACI (Agent-Computer Interface) by Aipolabs. Currently in beta, breaking changes are expected.

The ACI TypeScript SDK provides convenient access to the ACI REST API from any TypeScript/JavaScript application.

## Installation

```bash
npm install @aci-sdk/aci
# or
yarn add @aci-sdk/aci
# or
pnpm add @aci-sdk/aci
```

## Usage

```typescript
import { ACI } from '@aci-sdk/aci';

// Initialize the client with configuration
const client = new ACI({
  apiKey: process.env.ACI_API_KEY,
  // Optional: Configure retry settings
  maxRetries: 3,
  retryMinWait: 1000,
  retryMaxWait: 10000,
  retryMultiplier: 2,
});

// Search for apps
const apps = await client.apps.search({
  intent: "I want to search the web",
  allowed_apps_only: false,
  include_functions: true,
  categories: ["search"],
  limit: 10
});

// Get app details
const appDetails = await client.apps.get("BRAVE_SEARCH");

// Create app configuration
const configuration = await client.appConfigurations.create(
  "GMAIL",
  "OAUTH2"
);

// Link an account
const account = await client.linkedAccounts.link({
  app_name: "BRAVE_SEARCH",
  linked_account_owner_id: "user123",
  security_scheme: "API_KEY",
  api_key: "your-api-key"
});

// Execute a function
const result = await client.functions.execute({
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

## Features

- Full TypeScript support
- Complete API coverage
- Promise-based async/await interface
- Environment variable support for API key
- Comprehensive type definitions
- Automatic retry mechanism for failed requests
- Resource-based API organization

## API Reference

The SDK provides the following main features:

- Apps management
- App configurations
- Linked accounts
- Function execution
- Function definitions

For detailed API documentation, please refer to the [official ACI documentation](https://docs.aci.dev).

## License

MIT

## Contributing

We wcome contributions! Please see the [CONTRIBUTING.md](CONTRIBUTING.md) file for details.
