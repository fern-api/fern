import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Implementation } from "@modelcontextprotocol/sdk/types.js";

// Describe the name and version of an MCP implementation
export const implementation: Partial<Implementation> = {};

// Describe how to use the MCP server, its features, and its capabilities
export const serverOptions: Partial<ServerOptions> = {};

// Register MCP tools
export function registerTools(server: McpServer) {}
