import { MCPTool } from 'mcp-framework';
import { z } from 'zod';
import GraphQLConfig from '../config/GraphQLConfig';

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

  private config = GraphQLConfig.getInstance();

  constructor() {
    super();
  }

  schema = {
    operationName: {
      type: z.string().optional(),
      description:
        'Optional: The name of the operation to search for. If not provided, returns all operations.',
    },
  };


  private async fetchGraphQLSchema(): Promise<GraphQLSchema> {
    if (!this.config.isConfigured()) {
      throw new Error('GraphQL endpoint and token not configured. Please use config tool first.');
    }

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
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      const token = this.config.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(this.config.getEndpoint(), {
        method: 'POST',
        headers,
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
      const schema = await this.fetchGraphQLSchema();
      const operations = this.searchOperations(schema, input.operationName);

      if (operations.length === 0) {
        return input.operationName
          ? `No operations found matching "${input.operationName}"`
          : 'No operations found in the GraphQL schema';
      }

      const result = {
        endpoint: this.config.getEndpoint(),
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
