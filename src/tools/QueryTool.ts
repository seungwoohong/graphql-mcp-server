import { MCPTool } from 'mcp-framework';
import { z } from 'zod';
import GraphQLConfig from '../config/GraphQLConfig';

interface QueryInput {
  operationName: string;
  arguments: Record<string, any>;
}

class QueryTool extends MCPTool<QueryInput> {
  name = 'query';
  description = 'Execute a query by name of operation with arguments';

  private config = GraphQLConfig.getInstance();

  constructor() {
    super();
  }

  schema = {
    operationName: {
      type: z.string(),
      description: 'The name of the operation to execute',
    },
    arguments: {
      type: z.record(z.any(), z.any()),
      description: 'The arguments to pass to the operation',
    },
  };


  private async executeGraphQLQuery(operationName: string, arguments_: Record<string, any>): Promise<any> {
    if (!this.config.isConfigured()) {
      throw new Error('GraphQL endpoint and token not configured. Please use config tool first.');
    }

    // GraphQL 쿼리 실행을 위한 기본 구조
    // 실제 구현에서는 introspection을 통해 쿼리 스키마를 확인하고 동적으로 쿼리를 구성해야 함
    const query = `
      query ${operationName}(${Object.keys(arguments_).map(key => `$${key}: ${this.getArgumentType(arguments_[key])}`).join(', ')}) {
        ${operationName}(${Object.keys(arguments_).map(key => `${key}: $${key}`).join(', ')})
      }
    `;

    const variables = arguments_;

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
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result;
    } catch (error) {
      throw new Error(
        `Failed to execute GraphQL query: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private getArgumentType(value: any): string {
    if (typeof value === 'string') return 'String';
    if (typeof value === 'number') return 'Int';
    if (typeof value === 'boolean') return 'Boolean';
    if (Array.isArray(value)) return '[String]'; // 기본값, 실제로는 더 정확한 타입 추론 필요
    if (value === null) return 'String';
    return 'String'; // 기본값
  }

  async execute(input: QueryInput) {
    try {
      const result = await this.executeGraphQLQuery(input.operationName, input.arguments);

      return {
        success: true,
        endpoint: this.config.getEndpoint(),
        operationName: input.operationName,
        arguments: input.arguments,
        data: result.data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        operationName: input.operationName,
        arguments: input.arguments,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export default QueryTool;
