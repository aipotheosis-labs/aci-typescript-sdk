# ACI TypeScript SDK

The official TypeScript SDK for the ACI (Agent-Computer Interface) by Aipolabs. Currently in beta, breaking changes are expected.

The ACI TypeScript SDK provides convenient access to the ACI REST API from any TypeScript/JavaScript application.

## Installation

```bash
npm install aci-typescript-sdk
# or
yarn add aci-typescript-sdk
# or
pnpm add aci-typescript-sdk
```

## Usage

```typescript
import { ACI, SecurityScheme } from 'aci-typescript-sdk';

// Initialize the client
const client = new ACI(process.env.ACI_API_KEY);

// Search for apps
const apps = await client.searchApps({
  intent: "I want to search the web",
  allowed_apps_only: false,
  include_functions: true,
  categories: ["search"],
  limit: 10
});

// Get app details
const appDetails = await client.getApp("BRAVE_SEARCH");

// Create app configuration
const configuration = await client.createAppConfiguration(
  "GMAIL",
  SecurityScheme.OAUTH2
);

// Link an account
const account = await client.linkAccount({
  app_name: "BRAVE_SEARCH",
  linked_account_owner_id: "user123",
  security_scheme: SecurityScheme.API_KEY,
  api_key: "your-api-key"
});

// Execute a function
const result = await client.executeFunction({
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
