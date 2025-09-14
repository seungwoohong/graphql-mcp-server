import { MCPServer } from 'mcp-framework';

// MCP 서버 생성 (SSE용)
const server = new MCPServer({
  name: 'graphql-mcp-server',
  version: '0.0.1',
  transport: {
    type: 'sse',
    options: {
      port: parseInt(process.env.PORT || '8080'),
      endpoint: '/mcp',
      cors: {
        origin: '*',
        credentials: true
      }
    }
  }
});

console.log('Starting GraphQL MCP Server with SSE...');
console.log('Use the "config" tool to set your GraphQL endpoint and token');

// MCP 서버 시작
server.start();
