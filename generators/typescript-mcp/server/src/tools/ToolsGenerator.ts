import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { ServerGeneratorContext } from "../ServerGeneratorContext";

const SUBDIRECTORY_NAME = "";
const FILENAME = "index.ts";

export class ToolsGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ServerGeneratorContext
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
                        this.writeToolDefinitionsBlock(writer, endpoint, service);
                        writer.newLine();
                    });
                });
            }),
            directory: this.getSubDirectory(),
            filename: FILENAME,
            customConfig: this.context.customConfig
        });
    }

    private getSubDirectory(): RelativeFilePath {
        return join(RelativeFilePath.of(SUBDIRECTORY_NAME));
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getSubDirectory(), RelativeFilePath.of(FILENAME));
    }

    private writeImportsBlock(writer: ts.Writer) {
        writer.writeLine('import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";');
        writer.writeLine(
            `import { ${this.context.project.builder.sdkClientVariableName} } from "${this.context.project.builder.sdkPackageName}";`
        );
        writer.writeLine('import * as schemas from "../schemas";');
    }

    private writeClientInitializationBlock(writer: ts.Writer) {
        writer.writeLine(`const client = new ${this.context.project.builder.sdkClientVariableName}({`);
        writer.writeLine('    environment: () => ""');
        writer.writeLine("});");
    }

    private writeToolDefinitionsBlock(writer: ts.Writer, endpoint: HttpEndpoint, service: HttpService) {
        const endpointName = endpoint.name;
        const serviceFilepath = service.name.fernFilepath;
        const toolVariableName = this.context.project.builder.getToolVariableName(endpointName, serviceFilepath);
        const toolName = this.context.project.builder.getToolName(endpointName, serviceFilepath);
        const toolDescription = endpoint.docs;
        const sdkMethodPath = this.context.project.builder.getSdkMethodPath(endpointName, serviceFilepath);

        const { name: schemaName, fernFilepath: schemaFilepath } =
            endpoint.sdkRequest?.shape._visit({
                justRequestBody: (value) =>
                    value._visit({
                        typeReference: (value) =>
                            value.requestBodyType._visit({
                                container: () => undefined,
                                named: (value) => value,
                                primitive: () => undefined,
                                unknown: () => undefined,
                                _other: () => undefined
                            }),
                        bytes: () => undefined,
                        _other: () => undefined
                    }),
                wrapper: () => undefined,
                _other: () => undefined
            }) ?? {};

        const paramsFromSchema = schemaName
            ? `schemas.${this.context.project.builder.getSchemaVariableName(schemaName, schemaFilepath)}`
            : undefined;

        // TODO: fix this
        function capitalize(str: string) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }
        const schemaPrefix = service.name.fernFilepath.allParts.map((part) => part.pascalCase.safeName).join("");
        const partsFromPath = endpoint.path.parts.map((part) => ({
            key: part.pathParameter,
            value: `${schemaPrefix}${capitalize(part.pathParameter)}`
        }));
        const paramsFromPath = partsFromPath.length
            ? `{ ${partsFromPath.map((param) => `${param.key}: schemas.${param.value}`).join(", ")} }`
            : undefined;

        const toolParams =
            paramsFromSchema && paramsFromPath
                ? `${paramsFromSchema}.extend(${paramsFromPath}).shape`
                : paramsFromSchema
                  ? `${paramsFromSchema}.shape`
                  : paramsFromPath;

        // TODO: clean this up to use AST
        writer.writeLine(`// ${JSON.stringify(endpoint.method)}`);
        writer.writeLine(`export const ${toolVariableName} = {`);
        writer.writeLine("    register: function(server: McpServer) {");
        writer.writeLine("        return server.tool(");
        writer.writeLine(`            "${toolName}",`);
        if (toolDescription) {
            writer.writeLine(`            "${toolDescription}",`);
        }
        if (toolParams) {
            writer.writeLine(`            ${toolParams},`);
        }
        writer.writeLine("            async (params) => {");
        writer.writeLine(
            `                const { ${partsFromPath?.map((part) => part.key).join(", ")}${paramsFromPath && paramsFromSchema ? ", " : ""}${paramsFromSchema ? "...restParams" : ""} } = params;`
        );
        writer.writeLine(
            `                const result = await client.${sdkMethodPath}(${partsFromPath?.map((part) => part.key).join(", ")}${paramsFromPath && paramsFromSchema ? ", " : ""}${paramsFromSchema ? "restParams" : ""});`
        );
        writer.writeLine("                return {");
        writer.writeLine('                    content: [{ type: "text", text: JSON.stringify(result) }]');
        writer.writeLine("                };");
        writer.writeLine("            }");
        writer.writeLine("        );");
        writer.writeLine("    }");
        writer.writeLine("};");
    }
}
