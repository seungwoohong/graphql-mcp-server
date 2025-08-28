import { MCPTool } from 'mcp-framework';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

interface QueryInput {
  operationName: string;
  arguments: Record<string, any>;
}

class QueryTool extends MCPTool<QueryInput> {
  name = 'query';
  description = 'Execute a query by name of operation with arguments';

  schema = {
    operationName: {
      type: z.string(),
      description: 'The name of the operation to execute',
    },
    arguments: {
      type: z.record(z.any()),
      description: 'The arguments to pass to the operation',
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

    // 일반적인 프로젝트 루트 디렉토리들 확인
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

  private getAuthToken(): string | null {
    try {
      const envPath = this.findEnvFile();
      if (!envPath) {
        return null;
      }

      const envContent = readFileSync(envPath, 'utf-8');
      const tokenMatch = envContent.match(/GRAPHQL_TOKEN\s*=\s*(.+)/);
      if (tokenMatch) {
        return tokenMatch[1].trim().replace(/['"]/g, '');
      }

      return null;
    } catch (error) {
      console.warn('Failed to read GraphQL token from .env file:', error);
      return null;
    }
  }

  private async executeGraphQLQuery(endpoint: string, operationName: string, arguments_: Record<string, any>): Promise<any> {
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

      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
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
      const endpoint = this.getGraphQLEndpoint();
      const result = await this.executeGraphQLQuery(endpoint, input.operationName, input.arguments);

      return {
        success: true,
        endpoint,
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
