import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ServerGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine(`import { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
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
  version: packageJson.version,
};

// Describe how to use the MCP server, its features, and its capabilities
export const serverOptions: ServerOptions = {};

// Create an MCP server
export function createServer(
  implementation: Implementation,
  serverOptions?: ServerOptions
) {
  return new McpServer(implementation, serverOptions);
}

// Register MCP tools
export function registerTools(server: McpServer) {
  for (const tool of Object.values(tools)) {
    tool.register(server);
  }
}`);
            }),
            directory: this.getFilepath(),
            filename: "server.ts",
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of(""));
    }
}
