import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";

import * as tools from "./tools";

// Read name and version from package.json
const packageJson = require("../package.json") as any;
if (!packageJson.name || !packageJson.version) {
    throw new Error("!packageJson.name || !packageJson.version");
}

// Describe the name and version of an MCP implementation
export const implementation: Implementation = {
    name: packageJson.name,
    version: packageJson.version
};

// Describe how to use the MCP server, its features, and its capabilities
export const serverOptions: ServerOptions = {};

// Create an MCP server
export function createServer(implementation: Implementation, serverOptions?: ServerOptions) {
    return new McpServer(implementation, serverOptions);
}

// Register MCP tools
export function registerTools(server: McpServer) {
    for (const tool of Object.values(tools)) {
        tool.register(server);
    }
}
