import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface SearchInput {
  operationName: string;
}

class SearchTool extends MCPTool<SearchInput> {
  name = "search";
  description = "Search for an operation by name";

  schema = {
    operationName: {
      type: z.string(),
      description: "The name of the operation to search for",
    },
  };

  async execute(input: SearchInput) {
    return `Processed: Searching for ${input.operationName}`;
  }
}

export default SearchTool;