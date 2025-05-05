import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

const SUBDIRECTORY_NAME = "";
const FILENAME = "index.ts";

export class ToolsGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                this.writeImportsBlock(writer);
                writer.newLine();
                this.writeClientInitializationBlock(writer);
                writer.newLine();
                Object.values(this.context.ir.services).forEach((service) => {
                    service.endpoints.forEach((endpoint) => {
                        this.writeToolDefinitionsBlock(writer, service, endpoint);
                        writer.newLine();
                    });
                });
            }),
            directory: this.getSubdirectory(),
            filename: FILENAME,
            customConfig: this.context.customConfig
        });
    }

    private getSubdirectory(): RelativeFilePath {
        return join(RelativeFilePath.of(SUBDIRECTORY_NAME));
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getSubdirectory(), RelativeFilePath.of(FILENAME));
    }

    private writeImportsBlock(writer: ts.Writer) {
        writer.writeLine("import { McpServer } from \"@modelcontextprotocol/sdk/server/mcp.js\";");
        writer.writeLine(
            `import { ${this.context.project.sdkClientName} } from "${this.context.project.sdkPackageName}";`
        );
        writer.writeLine("import * as schemas from \"../schemas\";");
    }

    private writeClientInitializationBlock(writer: ts.Writer) {
        writer.writeLine(`const client = new ${this.context.project.sdkClientName}();`);
    }

    private writeToolDefinitionsBlock(writer: ts.Writer, service: HttpService, endpoint: HttpEndpoint) {
        const toolId = endpoint.name.camelCase.safeName;
        const toolName = endpoint.name.snakeCase.safeName;
        const toolDescription = endpoint.docs;
        const toolParamId = endpoint.method === "POST" ? `${toolId}Request` : undefined;

        // TODO: handle this in a more realistic way
        const sdkMethodId = endpoint.name.camelCase.safeName;

        writer.writeLine(`export const ${toolId} = {`);
        writer.writeLine("    register: function(server: McpServer) {");
        writer.writeLine("        return server.tool(");
        writer.writeLine(`            "${toolName}",`);
        if (toolDescription) {
            writer.writeLine(`            "${toolDescription}",`);
        }
        if (toolParamId) {
            writer.writeLine(`            schemas.${toolParamId}.shape,`);
        }
        writer.writeLine("            async (params) => {");
        writer.writeLine(`                const result = await client.${sdkMethodId}(params);`);
        writer.writeLine("                return {");
        writer.writeLine("                    content: [{ type: \"text\", text: result }]");
        writer.writeLine("                };");
        writer.writeLine("            }");
        writer.writeLine("        );");
        writer.writeLine("    }");
        writer.writeLine("};");
    }
}
