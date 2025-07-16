import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { Implementation } from "@modelcontextprotocol/sdk/types.js"

// Customize the name and version of the MCP implementation.
export const implementation: Partial<Implementation> = {}

// Customize how to use the MCP server, its features, and its capabilities.
export const serverOptions: Partial<ServerOptions> = {}

// Register custom MCP tools, resources, prompts, or other customizations.
export function register(server: McpServer) {}
