import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface ConfigInput {
  endpoint: string;
  token: string;
}

class ConfigTool extends MCPTool<ConfigInput> {
  name = "config";
  description = "Configure the GraphQL endpoint and token";

  schema = {
    endpoint: {
      type: z.string(),
      description: "The GraphQL endpoint to use",
    },
    token: {
      type: z.string(),
      description: "The token to use for authentication",
    },
  };

  async execute(input: ConfigInput) {
    return `Processed: Configuring GraphQL endpoint to ${input.endpoint} and token to ${input.token}`;
  }
}

export default ConfigTool;