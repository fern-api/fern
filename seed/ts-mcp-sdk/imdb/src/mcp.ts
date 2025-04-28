#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer, registerMcpTools } from "./mcp.js";

const packageJson = require("../package.json") as any;

// Configure and run local MCP server (stdio transport)
async function run() {
  if (!packageJson.name || !packageJson.version) {
    throw new Error("!packageJson.name || !packageJson.version");
  }

  const server = createMcpServer(packageJson.name, packageJson.version);
  registerMcpTools(server, db);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
run();
