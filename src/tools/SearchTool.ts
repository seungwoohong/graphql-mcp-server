import { MCPTool } from 'mcp-framework';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface SearchInput {
  operationName?: string;
}

interface GraphQLSchema {
  data?: {
    __schema?: {
      queryType?: {
        fields?: Array<{
          name: string;
          description?: string;
          args?: Array<{
            name: string;
            type: {
              name?: string;
              kind: string;
            };
          }>;
        }>;
      };
      mutationType?: {
        fields?: Array<{
          name: string;
          description?: string;
          args?: Array<{
            name: string;
            type: {
              name?: string;
              kind: string;
            };
          }>;
        }>;
      };
    };
  };
}

class SearchTool extends MCPTool<SearchInput> {
  name = 'search';
  description =
    'Search for GraphQL operations (queries and mutations) from the configured endpoint';

  schema = {
    operationName: {
      type: z.string().optional(),
      description:
        'Optional: The name of the operation to search for. If not provided, returns all operations.',
    },
  };

  private findEnvFile(): string | null {
    const clientCwd = process.env.MCP_CLIENT_CWD || process.env.PWD;
    if (clientCwd) {
      const envPath = join(clientCwd, '.env');
      if (existsSync(envPath)) {
        return envPath;
      }
    }
    let currentDir = process.cwd();
    const maxDepth = 10;

    for (let i = 0; i < maxDepth; i++) {
      const envPath = join(currentDir, '.env');
      if (existsSync(envPath)) {
        return envPath;
      }

      const parentDir = dirname(currentDir);
      if (parentDir === currentDir) {
        break;
      }
      currentDir = parentDir;
    }

    // 3. 일반적인 프로젝트 루트 디렉토리들 확인
    const commonPaths = [
      join(process.cwd(), '..', '.env'),
      join(process.cwd(), '..', '..', '.env'),
      join(process.cwd(), '..', '..', '..', '.env'),
    ];

    for (const path of commonPaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    return null;
  }

  private getGraphQLEndpoint(): string {
    try {
      const envPath = this.findEnvFile();

      if (!envPath) {
        throw new Error(
          'No .env file found in current or parent directories. Please create a .env file with GRAPHQL_ENDPOINT in your project root.'
        );
      }

      console.log(`Found .env file at: ${envPath}`);
      const envContent = readFileSync(envPath, 'utf-8');
      const endpointMatch = envContent.match(/GRAPHQL_ENDPOINT\s*=\s*(.+)/);
      if (endpointMatch) {
        return endpointMatch[1].trim().replace(/['"]/g, '');
      }

      throw new Error('GRAPHQL_ENDPOINT not found in .env file');
    } catch (error) {
      throw new Error(
        `Failed to read GraphQL endpoint from .env file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async fetchGraphQLSchema(endpoint: string): Promise<GraphQLSchema> {
    const introspectionQuery = `
      query IntrospectionQuery {
        __schema {
          queryType {
            fields {
              name
              description
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
          mutationType {
            fields {
              name
              description
              args {
                name
                type {
                  name
                  kind
                }
              }
            }
          }
        }
      }
    `;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: introspectionQuery,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        `Failed to fetch GraphQL schema: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private searchOperations(schema: GraphQLSchema, searchTerm?: string) {
    const operations: Array<{
      name: string;
      type: 'query' | 'mutation';
      description?: string;
      args?: Array<{ name: string; type: string }>;
    }> = [];

    // 쿼리 추가
    if (schema.data?.__schema?.queryType?.fields) {
      schema.data.__schema.queryType.fields.forEach(field => {
        if (
          !searchTerm ||
          field.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          operations.push({
            name: field.name,
            type: 'query',
            description: field.description || undefined,
            args: field.args?.map(arg => ({
              name: arg.name,
              type: arg.type.name || arg.type.kind,
            })),
          });
        }
      });
    }

    // 뮤테이션 추가
    if (schema.data?.__schema?.mutationType?.fields) {
      schema.data.__schema.mutationType.fields.forEach(field => {
        if (
          !searchTerm ||
          field.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          operations.push({
            name: field.name,
            type: 'mutation',
            description: field.description || undefined,
            args: field.args?.map(arg => ({
              name: arg.name,
              type: arg.type.name || arg.type.kind,
            })),
          });
        }
      });
    }

    return operations;
  }

  async execute(input: SearchInput) {
    try {
      const endpoint = this.getGraphQLEndpoint();
      const schema = await this.fetchGraphQLSchema(endpoint);
      const operations = this.searchOperations(schema, input.operationName);

      if (operations.length === 0) {
        return input.operationName
          ? `No operations found matching "${input.operationName}"`
          : 'No operations found in the GraphQL schema';
      }

      const result = {
        endpoint,
        totalOperations: operations.length,
        operations: operations.map(op => ({
          name: op.name,
          type: op.type,
          description: op.description,
          arguments: op.args || [],
        })),
      };

      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`;
    }
  }
}

export default SearchTool;
