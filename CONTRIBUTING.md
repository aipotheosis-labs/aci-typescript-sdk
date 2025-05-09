# ACI TypeScript SDK Development Guide

This guide provides instructions for setting up and developing the ACI TypeScript SDK locally.

## Prerequisites

- Node.js (v16 or higher)
- pnpm (recommended) or npm
- Git

## Installation

1. Clone the repository:
```bash
git clone https://github.com/aipotheosis-labs/aci-typescript-sdk.git
cd aci-typescript-sdk
```

2. Install dependencies:
```bash
pnpm install
```

## Environment Configuration

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Add the following environment variables to your `.env` file:


## Development

### Building the Project

To build the TypeScript code:
```bash
pnpm run build
```

This will compile the TypeScript code into JavaScript in the `dist` directory.

### Running Tests

> [!IMPORTANT]
> You need to configure following app configurations in your ACI account to run the tests:
> - ARXIV
> - BRAVE_SEARCH
> - GITHUB
> We might need to change test logic so you don't need to do this in the future.

The project uses Jest for testing. To run the tests:
```bash 
pnpm test
```

To run tests in watch mode during development:
```bash
pnpm runtest
```

### Code Quality

The project uses ESLint for linting and Prettier for code formatting.

To run the linter:
```bash
pnpm run lint
```

To format your code:
```bash
pnpm run format
```

## Project Structure

```
__tests__/            # Test files
examples/             # Examples
src/
├── index.ts           # Main entry point
├── client.ts          # API client implementation
├── constants.ts       # SDK constants
├── exceptions.ts      # Custom exceptions
├── meta_functions/    # Meta functions implementation
├── resource/          # Resource implementations
├── schemas/           # Zod schemas
└── types/            # TypeScript type definitions
```

## Publishing

The project uses Changesets for versioning and publishing. To create a new version:
You need change the version in the `package.json` then commit and push to the main branch.
The CI will build the project and publish the new version to npm.



## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request