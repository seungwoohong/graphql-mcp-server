import { MCPServer } from 'mcp-framework';

// MCP 서버 생성
const server = new MCPServer({
  name: 'graphql-mcp-server',
  version: '0.0.1',
  
});

console.log('Starting GraphQL MCP Server...');
console.log('Use the "config" tool to set your GraphQL endpoint and token');

server.start();
