#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolsList } from "./tools";

// Create an MCP server
export function createMcpServer(name: string, version: string) {
  return new McpServer(
    {
      name,
      version,
    }
  );
}

// Register MCP tools
export function registerMcpTools(server: McpServer) {
  for (const tool of toolsList) {
    server.tool(tool.name, tool.description, tool.paramSchema, tool.cb);
  }
}

