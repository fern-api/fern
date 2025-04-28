import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

const SERVER_DIRECTORY = "src";

export class ServerGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(SERVER_DIRECTORY));
    }

    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine(`#!/usr/bin/env node

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
`);
            }),
            directory: RelativeFilePath.of(SERVER_DIRECTORY),
            filename: "mcp.ts",
            customConfig: this.context.customConfig
        });
    }
}
