# GraphQL MCP Server

A Model Context Protocol (MCP) server that provides GraphQL query and search capabilities. This server can be deployed to Google Cloud Run and used by multiple clients simultaneously.

## Features

- **GraphQL Query Execution**: Execute GraphQL queries with dynamic configuration
- **GraphQL Schema Search**: Search and discover GraphQL operations
- **Dynamic Configuration**: Set GraphQL endpoint and token per client
- **Multiple Transport Support**: stdio, HTTP Stream, and SSE
- **Cloud Run Ready**: Deploy to Google Cloud Run for multi-user access

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm run build:server

# Start MCP server (stdio - for Cursor)
pnpm run start:bridge

# Start MCP server (HTTP Stream)
pnpm run start:http-mcp

# Start MCP server (SSE)
pnpm run start:sse-mcp
```

### Cloud Run Deployment

```bash
# Deploy to Google Cloud Run
gcloud run deploy graphql-mcp-server \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Usage

### 1. Configure GraphQL Endpoint

First, set your GraphQL endpoint and token:

```json
{
  "endpoint": "https://your-graphql-api.com/graphql",
  "token": "your-auth-token"
}
```

### 2. Execute GraphQL Queries

```json
{
  "operationName": "getUsers",
  "arguments": {
    "limit": 10,
    "offset": 0
  }
}
```

### 3. Search GraphQL Operations

```json
{
  "query": "user",
  "operationType": "query"
}
```

## Available Tools

- **config**: Configure GraphQL endpoint and token
- **query**: Execute GraphQL queries
- **search**: Search GraphQL schema operations

## Transport Types

### stdio (Local Development)
- Used by Cursor and other MCP clients
- Direct process communication
- Command: `pnpm run start:bridge`

### HTTP Stream (Cloud Run)
- HTTP-based streaming protocol
- Cloud Run compatible
- Command: `pnpm run start:http-mcp`

### SSE (Server-Sent Events)
- Browser-compatible streaming
- Auto-reconnection support
- Command: `pnpm run start:sse-mcp`

## Cursor Integration

Add to your Cursor MCP configuration:

```json
{
  "mcpServers": {
    "graphql-mcp-server": {
      "command": "node",
      "args": ["dist/sse-mcp-server.js"],
      "env": {
        "PORT": "8080"
      }
    }
  }
}
```

## Cloud Run 배포

### 자동 배포 (GitHub Actions)
1. GitHub에 코드 푸시
2. GitHub Actions가 자동으로 Cloud Run에 배포
3. `GCP_SA_KEY` 시크릿 설정 필요

### 수동 배포
```bash
# Google Cloud CLI 설치
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init

# Cloud Run에 배포
gcloud run deploy graphql-mcp-server \
  --source . \
  --region asia-northeast3 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Cloud Run Endpoints

After deployment, your service will be available at:
- **MCP Endpoint**: `https://your-service-url.run.app/mcp`
- **Health Check**: `https://your-service-url.run.app/health`

## Environment Variables

- `PORT`: Server port (default: 8080)
- `NODE_ENV`: Environment (production/development)

## Development

```bash
# Watch mode
pnpm run dev

# Lint
pnpm run lint

# Format
pnpm run format
```

## License

MIT