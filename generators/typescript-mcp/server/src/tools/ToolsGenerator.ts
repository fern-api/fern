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
        writer.writeLine('import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";');
        writer.writeLine(
            `import { ${this.context.project.helpers.generatedSdkClientName} } from "${this.context.project.helpers.generatedSdkPackageName}/dist";`
        );
        writer.writeLine('import * as schemas from "../schemas";');
    }

    private writeClientInitializationBlock(writer: ts.Writer) {
        writer.writeLine(`const client = new ${this.context.project.helpers.generatedSdkClientName}({`);
        writer.writeLine("    environment: () => \"\"");
        writer.writeLine("});");
    }
    private writeToolDefinitionsBlock(writer: ts.Writer, service: HttpService, endpoint: HttpEndpoint) {
        const toolIdentifier = this.context.project.helpers.fullyQualifiedToolIdentifier(service, endpoint);
        const toolName = this.context.project.helpers.fullyQualifiedToolName(service, endpoint);
        const toolDescription = endpoint.docs;

        let toolParamRef;
        switch (endpoint.method) {
            case "GET":
                toolParamRef = `{ ${endpoint.path.parts.map((part) => `${part.pathParameter}: schemas.${part.pathParameter}`).join(", ")} }`;
                break;
            case "DELETE":
            case "PATCH":
            case "POST":
            case "PUT":
                toolParamRef = `schemas.${this.context.project.helpers.fullyQualifiedSchemaIdentifier(service, endpoint)}Request.shape`;
                break;
            default:
                break;
        }

        const sdkMethodPath = this.context.project.helpers.fullyQualifiedMethodPath(service, endpoint);

        writer.writeLine(`// ${endpoint.sdkRequest?.requestParameterName.originalName}`);
        writer.writeLine(
            `// ${endpoint.sdkRequest?.shape._visit({
                justRequestBody: (value) =>
                    value._visit({
                        typeReference: (value) =>
                            `typeReference: ${value.requestBodyType._visit({
                                container: (value) => `container: ${value._visit}`,
                                named: (value) => `named: ${value.fernFilepath.file?.originalName}`,
                                primitive: (value) => `primitive: ${value.v1}`,
                                unknown: () => "unknown",
                                _other: () => "other"
                            })}`,
                        bytes: (value) => `bytes: ${value.contentType}`,
                        _other: (value) => `other: ${value.type}`
                    }),
                wrapper: (value) => `wrapper: ${value.wrapperName.originalName}`,
                _other: (value) => `other: ${value.type}`
            })}`
        );
        writer.writeLine(`// ${endpoint.sdkRequest?.requestParameterName.originalName}`);
        writer.writeLine(`// ${endpoint.sdkRequest?.streamParameter?.property.name.name.originalName}`);
        writer.writeLine(`export const ${toolIdentifier} = {`);
        writer.writeLine("    register: function(server: McpServer) {");
        writer.writeLine("        return server.tool(");
        writer.writeLine(`            "${toolName}",`);
        if (toolDescription) {
            writer.writeLine(`            "${toolDescription}",`);
        }
        if (toolParamRef) {
            writer.writeLine(`            ${toolParamRef},`);
        }
        writer.writeLine("            async (params) => {");
        writer.writeLine(`                const result = await client.${sdkMethodPath}(params);`);
        writer.writeLine("                return {");
        writer.writeLine('                    content: [{ type: "text", text: JSON.stringify(result) }]');
        writer.writeLine("                };");
        writer.writeLine("            }");
        writer.writeLine("        );");
        writer.writeLine("    }");
        writer.writeLine("};");
    }
}
