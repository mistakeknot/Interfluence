import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerCorpusTools } from "./tools/corpus.js";
import { registerProfileTools } from "./tools/profile.js";

const server = new McpServer({
  name: "interfluence",
  version: "0.1.0",
});

registerCorpusTools(server);
registerProfileTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
