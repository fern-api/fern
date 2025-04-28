import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

const ENTRY_DIRECTORY = "src";

export class EntryStdioGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(ENTRY_DIRECTORY));
    }

    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine(`#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { toolsList } from "./tools";

// Create an MCP server
export function createMcpServer(name: string, version: string) {
  return new McpServer(
    {
      name: name,
      version: version,
    }
  );
}

// Register MCP tools
export function registerMcpTools(server: McpServer) {
  for (const tool of toolsList) {
    server.tool(tool.name, tool.description, tool.paramSchema, tool.cb);
  }
}

`);
            }),
            directory: RelativeFilePath.of(ENTRY_DIRECTORY),
            filename: "index.ts",
            customConfig: this.context.customConfig
        });
    }
}
