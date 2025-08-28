# graphql-mcp-server

A Model Context Protocol (MCP) server built with mcp-framework.

## Quick Start

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build

# Start the server
pnpm start
```

## Configuration

### Environment Setup

The MCP server will automatically look for a `.env` file in the following locations (in order of priority):

1. **Client's working directory** (where the MCP client is running)
2. **Parent directories** (up to 10 levels up)
3. **Common project root locations**

Create a `.env` file in your project root with your GraphQL endpoint:

```bash
# Copy the example file
cp env.example .env

# Edit .env with your GraphQL endpoint
GRAPHQL_ENDPOINT=https://your-graphql-api.com/graphql
```

Example `.env` file:
```env
# GraphQL API endpoint URL
GRAPHQL_ENDPOINT=https://api.example.com/graphql

# Optional: Authentication token (if required)
# GRAPHQL_TOKEN=your-auth-token-here
```

**Important**: The `.env` file should be in the project where you're using the MCP server, not necessarily in the MCP server project itself.

## Development

### Code Formatting

This project uses Prettier and ESLint for code formatting and linting:

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Lint and fix code
pnpm lint

# Check linting
pnpm lint:check
```

## Consideration

### 고려사항

- 사용자별, 환경별 endpoint 가 다른데 이 정보를 MCP-server에 어떻게 전달할 것인가? tool, samples
- input 데이터양이 많을 때 어떻게 전달할 것인가?
- mutation은 호출 되면 안된다

## Project Structure

```
graphql-mcp-server/
├── src/
│   ├── tools/        # MCP Tools
│   │   ├── ConfigTool.ts
│   │   ├── QueryTool.ts
│   │   └── SearchTool.ts
│   └── index.ts      # Server entry point
├── dist/             # Built files
├── .env              # Environment configuration (create from env.example)
├── env.example       # Environment configuration example
├── .prettierrc       # Prettier configuration
├── .eslintrc.json    # ESLint configuration
├── .vscode/          # VS Code settings
├── package.json
└── tsconfig.json
```

## Available Tools

### Config Tool
- **Name**: `config`
- **Description**: Configure the GraphQL endpoint and token
- **Parameters**:
  - `endpoint`: The GraphQL endpoint to use
  - `token`: The token to use for authentication

### Query Tool
- **Name**: `query`
- **Description**: Execute a query by name of operation with arguments
- **Parameters**:
  - `operationName`: The name of the operation to execute
  - `arguments`: The arguments to pass to the operation

### Search Tool
- **Name**: `search`
- **Description**: Search for GraphQL operations (queries and mutations) from the configured endpoint
- **Parameters**:
  - `operationName` (optional): The name of the operation to search for. If not provided, returns all operations.
- **Features**:
  - Automatically finds `.env` file in client's project directory
  - Performs introspection to get schema information
  - Returns all available queries and mutations
  - Supports filtering by operation name
  - Includes operation descriptions and argument information

**Example Usage:**
```json
{
  "name": "search",
  "arguments": {
    "operationName": "countries"
  }
}
```

**Response Format:**
```json
{
  "endpoint": "https://api.example.com/graphql",
  "totalOperations": 6,
  "operations": [
    {
      "name": "countries",
      "type": "query",
      "description": "Get list of countries",
      "arguments": [
        {
          "name": "filter",
          "type": "CountryFilterInput"
        }
      ]
    }
  ]
}
```

## Adding Components

The project comes with example tools in `src/tools/`. You can add more tools using the CLI:

```bash
# Add a new tool
mcp add tool my-tool

# Example tools you might create:
mcp add tool data-processor
mcp add tool api-client
mcp add tool file-handler
```

## Tool Development

Example tool structure:

```typescript
import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface MyToolInput {
  message: string;
}

class MyTool extends MCPTool<MyToolInput> {
  name = "my_tool";
  description = "Describes what your tool does";

  schema = {
    message: {
      type: z.string(),
      description: "Description of this input parameter",
    },
  };

  async execute(input: MyToolInput) {
    // Your tool logic here
    return `Processed: ${input.message}`;
  }
}

export default MyTool;
```

## Publishing to npm

1. Update your package.json:
   - Ensure `name` is unique and follows npm naming conventions
   - Set appropriate `version`
   - Add `description`, `author`, `license`, etc.
   - Check `bin` points to the correct entry file

2. Build and test locally:
   ```bash
   pnpm run build
   pnpm link
   graphql-mcp-server  # Test your CLI locally
   ```

3. Login to npm (create account if necessary):
   ```bash
   npm login
   ```

4. Publish your package:
   ```bash
   npm publish
   ```

After publishing, users can add it to their claude desktop client (read below) or run it with npx

## Using with Claude Desktop

### Local Development

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "graphql-mcp-server": {
      "command": "node",
      "args":["/absolute/path/to/graphql-mcp-server/dist/index.js"]
    }
  }
}
```

### After Publishing

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "graphql-mcp-server": {
      "command": "npx",
      "args": ["graphql-mcp-server"]
    }
  }
}
```

## Using with Cursor

### Cursor 설정

1. **Cursor 설정 파일 열기**:
   ```bash
   # macOS
   code ~/Library/Application\ Support/Cursor/User/settings.json
   ```

2. **MCP 설정 추가**:
   ```json
   {
     "mcp.servers": {
       "graphql-mcp-server": {
         "command": "node",
         "args": ["/absolute/path/to/graphql-mcp-server/dist/index.js"],
         "env": {}
       }
     },
     "mcp.enabled": true
   }
   ```

3. **Cursor 재시작**

4. **사용**: `Cmd/Ctrl + Shift + P` → "MCP" 검색 → 도구 사용

## Building and Testing

1. Make changes to your tools
2. Run `pnpm run build` to compile
3. The server will automatically load your tools on startup

## Learn More

- [MCP Framework Github](https://github.com/QuantGeekDev/mcp-framework)
- [MCP Framework Docs](https://mcp-framework.com)
