import { MCPServer } from 'mcp-framework';

const server = new MCPServer({
  name: 'graphql-mcp-server',
  version: '0.0.1',
});

console.log('Starting GraphQL MCP Server...');
server.start();
