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
```env
# API Configuration
ACI_API_KEY=your_api_key_here
ACI_API_URL=https://api.aipolabs.com/v1  # or your custom API URL
```

Replace `your_api_key_here` with your actual ACI API key.

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

The project uses Jest for testing. To run the tests:
```bash 
pnpm test
```

To run tests in watch mode during development:
```bash
pnpm test -- --watch
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

1. Create a changeset:
```bash
pnpm run changeset
```

2. Update the version:
```bash
pnpm run version
```

3. Publish to npm:
```bash
pnpm run release
```

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Run tests and ensure they pass
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
