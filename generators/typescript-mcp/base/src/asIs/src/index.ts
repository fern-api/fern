#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createServer, implementation, registerTools, serverOptions } from "./server.js";
import * as custom from "./server.custom.js";

// Configure and run local MCP server (stdio transport)
async function run() {
    const server = createServer(
        {
            ...implementation,
            ...custom.implementation
        },
        {
            ...serverOptions,
            ...custom.serverOptions
        }
    );
    registerTools(server);
    custom.register(server);

    const transport = new StdioServerTransport();
    await server.connect(transport);
}
run();
