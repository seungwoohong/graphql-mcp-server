import { MCPTool } from 'mcp-framework';
import { z } from 'zod';
import GraphQLConfig from '../config/GraphQLConfig';

interface ConfigInput {
  endpoint?: string;
  token?: string;
}

class ConfigTool extends MCPTool<ConfigInput> {
  name = 'config';
  description = 'Configure or get the GraphQL endpoint and token';

  private config = GraphQLConfig.getInstance();

  constructor() {
    super();
  }

  schema = {
    endpoint: {
      type: z.string().optional(),
      description: 'The GraphQL endpoint to use (optional)',
    },
    token: {
      type: z.string().optional(),
      description: 'The token to use for authentication (optional)',
    },
  };

  async execute(input: ConfigInput) {
    // 입력이 있으면 업데이트
    if (input.endpoint || input.token) {
      this.config.setConfig(
        input.endpoint || this.config.getEndpoint(),
        input.token || this.config.getToken()
      );
    }

    return {
      message: this.config.isConfigured() 
        ? 'Configuration updated successfully' 
        : 'Please configure GraphQL endpoint and token first',
      currentConfig: {
        endpoint: this.config.getEndpoint() || 'Not set',
        token: this.config.getToken() ? '***' + this.config.getToken().slice(-4) : 'Not set'
      }
    };
  }
}

export default ConfigTool;
