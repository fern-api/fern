import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { SdkGeneratorContext } from "../SdkGeneratorContext";

const SUBDIRECTORY_NAME = "";
const FILENAME = "server.ts";

export class ServerGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    SdkGeneratorContext
> {
    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                this.writeImportsBlock(writer);
                writer.newLine();
                this.writeImplementationBlock(writer);
                writer.newLine();
                this.writeServerOptionsBlock(writer);
                writer.newLine();
                this.writeCreateServerBlock(writer);
                writer.newLine();
                this.writeRegisterToolsBlock(writer);
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
        writer.writeLine("import { ServerOptions } from \"@modelcontextprotocol/sdk/server/index.js\";");
        writer.writeLine("import { McpServer } from \"@modelcontextprotocol/sdk/server/mcp.js\";");
        writer.writeLine("import { Implementation } from \"@modelcontextprotocol/sdk/types.js\";");
        writer.newLine();
        writer.writeLine("import * as tools from \"./tools\";");
    }

    private writeImplementationBlock(writer: ts.Writer) {
        writer.writeLine("// Read name and version from package.json");
        writer.writeLine("const packageJson = require(\"../package.json\") as any;");
        writer.writeLine("if (!packageJson.name || !packageJson.version) {");
        writer.writeLine("    throw new Error(\"!packageJson.name || !packageJson.version\");");
        writer.writeLine("}");
        writer.newLine();
        writer.writeLine("// Describe the name and version of an MCP implementation");
        writer.writeLine("export const implementation: Implementation = {");
        writer.writeLine("    name: packageJson.name,");
        writer.writeLine("    version: packageJson.version");
        writer.writeLine("};");
    }

    private writeServerOptionsBlock(writer: ts.Writer) {
        writer.writeLine("// Describe how to use the MCP server, its features, and its capabilities");
        writer.writeLine("export const serverOptions: ServerOptions = {};");
    }

    private writeCreateServerBlock(writer: ts.Writer) {
        writer.writeLine("// Create an MCP server");
        writer.writeLine(
            "export function createServer(implementation: Implementation, serverOptions?: ServerOptions) {"
        );
        writer.writeLine("    return new McpServer(implementation, serverOptions);");
        writer.writeLine("}");
    }

    private writeRegisterToolsBlock(writer: ts.Writer) {
        writer.writeLine("// Register MCP tools");
        writer.writeLine("export function registerTools(server: McpServer) {");
        writer.writeLine("    for (const tool of Object.values(tools)) {");
        writer.writeLine("        tool.register(server);");
        writer.writeLine("    }");
        writer.writeLine("}");
    }
}
