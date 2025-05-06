# ACI TypeScript SDK Examples

This directory contains example code demonstrating how to use the ACI TypeScript SDK.

## Available Examples

- `weather-app.ts`: A comprehensive example showing how to interact with a weather app using the SDK. It demonstrates:
  - App search and details retrieval
  - App configuration management
  - Linked account operations
  - Function search, definition, and execution

## Running the Examples

### Option 1: Using pnpm link (Recommended for Development)

1. In the root directory of the SDK:
```bash
pnpm link --global
```

2. In the examples directory:
```bash
pnpm link --global aci-typescript-sdk
```

3. Set your API key:
```bash
export ACI_API_KEY='your-api-key'
```

4. Run an example:
```bash
# Using ts-node
ts-node weather-app.ts

# Or using tsx
tsx weather-app.ts
```

### Option 2: Using npm install (For Production)

1. First, install the SDK:
```bash
npm install aci-typescript-sdk
```

2. Set your API key:
```bash
export ACI_API_KEY='your-api-key'
```

3. Run an example:
```bash
# Using ts-node
ts-node weather-app.ts

# Or using tsx
tsx weather-app.ts
```

## Notes

- Make sure to replace 'your-api-key' with your actual ACI API key
- The examples use TypeScript, so you'll need to have TypeScript installed
- You can use either `ts-node` or `tsx` to run the examples
- The examples include error handling and cleanup operations
- Each example is documented with comments explaining each step
- For local development, use pnpm link to test changes in real-time
- When using pnpm link, the examples use relative imports to the source code 