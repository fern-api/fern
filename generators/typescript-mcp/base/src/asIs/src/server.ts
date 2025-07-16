import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { Implementation } from "@modelcontextprotocol/sdk/types.js"

import * as tools from "./tools"

const packageJson = require("../package.json") as any
if (!packageJson.name || !packageJson.version) {
    throw new Error("!packageJson.name || !packageJson.version")
}

// Default MCP implementation (uses name and version from package.json by default).
export const implementation: Implementation = {
    name: packageJson.name,
    version: packageJson.version
}

// Default MCP server options.
export const serverOptions: ServerOptions = {
    /* no-op */
}

export function createServer(implementation: Implementation, serverOptions?: ServerOptions) {
    return new McpServer(implementation, serverOptions)
}

// Default MCP tools.
export function registerTools(server: McpServer) {
    for (const tool of Object.values(tools)) {
        tool.register(server)
    }
}
