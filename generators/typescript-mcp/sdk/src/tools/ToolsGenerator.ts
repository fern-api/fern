import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

export class ToolsGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine("import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';");
                writer.writeLine("import { ImdbClient } from '@imdb/client';");
                writer.writeLine("import * as schemas from '../schemas';");
                writer.writeLine("\n");
                writer.writeLine("const client = new ImdbClient();");
                writer.writeLine(
                    Object.entries(this.context.ir.services)
                        .map(([_, service]) => {
                            return service.endpoints
                                .map((endpoint) => {
                                    return `
export const ${endpoint.name.camelCase.safeName} = {
  register: function(server: McpServer) {
    return server.tool(
      "${endpoint.name.snakeCase.safeName}",
      ${endpoint.docs ? `"${endpoint.docs}"` : "undefined"},
      ${endpoint.method === "POST" ? `schemas.${endpoint.name.camelCase.safeName}Request` : "undefined"},
      async (params) => {
        const result = await client.${endpoint.name.camelCase.safeName}(params);
        return {
          content: [{ type: "text", text: result }],
        };
    }
    );
  }
}`;
                                })
                                .join("\n\n");
                        })
                        .join("\n")
                );
            }),
            directory: RelativeFilePath.of(""),
            filename: "index.ts",
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return join(RelativeFilePath.of("tools"));
    }
}
