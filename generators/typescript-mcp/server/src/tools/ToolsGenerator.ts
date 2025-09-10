import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import {
    FileGenerator,
    FunctionNode,
    FunctionParameterNode,
    MethodInvocationNode,
    ObjectLiteralNode,
    TypescriptFile,
    ZodTypeMapper
} from "@fern-api/typescript-mcp-base";

import { HttpEndpoint, HttpService } from "@fern-fern/ir-sdk/api";

import { ServerGeneratorContext } from "../ServerGeneratorContext";

export class ToolsGenerator extends FileGenerator<
    TypescriptFile,
    TypescriptCustomConfigSchema,
    ServerGeneratorContext
> {
    private readonly mcpSdkReference: ts.Reference;
    private readonly sdkClientClassReference: ts.Reference;
    private readonly sdkClientVariableName: string;
    private readonly schemasReference: ts.Reference;
    constructor(context: ServerGeneratorContext) {
        super(context);
        this.mcpSdkReference = ts.reference({
            name: "McpServer",
            importFrom: { type: "named", moduleName: "@modelcontextprotocol/sdk/server/mcp.js" }
        });
        this.sdkClientClassReference = ts.reference({
            name: this.context.project.builder.sdkClientClassName,
            importFrom: { type: "named", moduleName: this.context.project.builder.sdkModuleName }
        });
        this.sdkClientVariableName = "client";
        this.schemasReference = ts.reference({
            name: "",
            importFrom: { type: "star", moduleName: "../schemas", starImportAlias: "schemas" }
        });
    }

    // TODO: properly generate config object for SDK client constructor
    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.variable({
                        name: this.sdkClientVariableName,
                        const: true,
                        initializer: ts.instantiateClass({
                            class_: this.sdkClientClassReference,
                            arguments_: [
                                new ObjectLiteralNode({
                                    fields: [
                                        {
                                            name: "environment",
                                            value: new FunctionNode({
                                                parameters: [],
                                                body: ts.codeblock((writer) => {
                                                    writer.write("return ");
                                                    writer.write('""');
                                                })
                                            })
                                        }
                                    ]
                                })
                            ]
                        })
                    })
                );
                writer.newLine();
                for (const service of Object.values(this.context.ir.services)) {
                    for (const endpoint of service.endpoints) {
                        const toolDefinition = new ToolDefinition({
                            mcpSdkReference: this.mcpSdkReference,
                            sdkClientClassReference: this.sdkClientClassReference,
                            sdkClientVariableName: this.sdkClientVariableName,
                            schemasReference: this.schemasReference,
                            endpoint,
                            service,
                            builder: this.context.project.builder,
                            zodTypeMapper: this.context.zodTypeMapper
                        });
                        toolDefinition.write(writer);
                        writer.newLine();
                    }
                }
            }),
            directory: this.getDirectory(),
            filename: this.getFilename(),
            customConfig: this.context.customConfig
        });
    }

    protected getDirectory(): RelativeFilePath {
        return RelativeFilePath.of("");
    }

    protected getFilename(): string {
        return "index.ts";
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }
}

export declare namespace ToolDefinition {
    interface Args {
        mcpSdkReference: ts.Reference;
        sdkClientClassReference: ts.Reference;
        sdkClientVariableName: string;
        schemasReference: ts.Reference;
        endpoint: HttpEndpoint;
        service: HttpService;
        builder: ServerGeneratorContext["project"]["builder"];
        zodTypeMapper: ZodTypeMapper;
    }
}

export class ToolDefinition {
    private readonly sdkMethodPath: string;

    private readonly toolVariableName: string;
    private readonly toolName: string;
    private readonly toolDescription?: string;

    private readonly schemaVariableName?: string;

    public constructor(private readonly args: ToolDefinition.Args) {
        this.sdkMethodPath = this.args.builder.getSdkMethodPath(
            this.args.endpoint.name,
            this.args.service.name.fernFilepath
        );

        this.toolVariableName = this.args.builder.getToolVariableName(
            this.args.endpoint.name,
            this.args.service.name.fernFilepath
        );
        this.toolName = this.args.builder.getToolName(this.args.endpoint.name, this.args.service.name.fernFilepath);
        this.toolDescription = this.args.endpoint.docs;

        this.schemaVariableName =
            this.args.endpoint.sdkRequest && this.args.zodTypeMapper.convertSdkRequest(this.args.endpoint.sdkRequest);
    }

    write(writer: ts.Writer): void {
        const hasSchema = !!this.schemaVariableName;
        const writeSchema = (writer: ts.Writer) => {
            writer.writeNode(this.args.schemasReference);
            hasSchema && writer.write(this.schemaVariableName);
        };

        const partsFromPath = this.getPartsFromPath();
        const hasPartsFromPath = partsFromPath.length > 0;
        const writeSchemaShapeFromParts = (writer: ts.Writer) => {
            writer.writeNode(
                new ObjectLiteralNode({
                    fields: partsFromPath.map((part) => ({
                        name: part.key,
                        value: ts.codeblock((writer) => {
                            writer.writeNode(this.args.schemasReference);
                            writer.write(part.value);
                        })
                    }))
                })
            );
        };

        const hasAnyParams = hasSchema || hasPartsFromPath;
        const writeParams = (writer: ts.Writer) => {
            if (hasSchema && hasPartsFromPath) {
                writeSchema(writer);
                writer.write(".extend(");
                writeSchemaShapeFromParts(writer);
                writer.write(").shape");
            } else if (hasSchema) {
                writeSchema(writer);
                writer.write(".shape");
            } else if (hasPartsFromPath) {
                writeSchemaShapeFromParts(writer);
            }
        };

        const writeExtractParams = (writer: ts.Writer) => {
            if (hasPartsFromPath) {
                writer.write("const { ");
                writer.write(partsFromPath?.map((part) => part.key).join(", "));
                writer.write(hasSchema && hasPartsFromPath ? ", " : "");
                writer.write(hasSchema ? "...request" : "");
                writer.write(" } = params;");
            } else if (hasSchema) {
                writer.write("const request = params;");
            }
        };

        const writeBody = (writer: ts.Writer) => {
            writeExtractParams(writer);
            writer.writeNodeStatement(
                ts.variable({
                    name: "result",
                    const: true,
                    initializer: ts.codeblock((writer) => {
                        writer.write("await ");
                        writer.writeNode(
                            new MethodInvocationNode({
                                on: ts.codeblock(this.args.sdkClientVariableName),
                                method: this.sdkMethodPath,
                                arguments_: [
                                    ...(partsFromPath ?? []).map((part) =>
                                        ts.codeblock((writer) => {
                                            writer.write(part.key);
                                        })
                                    ),
                                    ...(hasSchema
                                        ? [
                                              ts.codeblock((writer) => {
                                                  writer.write("request");
                                              })
                                          ]
                                        : [])
                                ]
                            })
                        );
                    })
                })
            );
            writer.write("return ");
            writer.writeNodeStatement(
                new ObjectLiteralNode({
                    fields: [
                        {
                            name: "content",
                            value: ts.codeblock((writer) => {
                                writer.write('[{ type: "text", text: JSON.stringify(result) }]');
                            })
                        }
                    ]
                })
            );
        };

        writer.writeNode(
            ts.variable({
                name: this.toolVariableName,
                const: true,
                export: true,
                initializer: ts.codeblock((writer) => {
                    writer.writeNode(
                        new ObjectLiteralNode({
                            fields: [
                                {
                                    name: "register",
                                    value: new FunctionNode({
                                        parameters: [
                                            new FunctionParameterNode({
                                                name: "server",
                                                type: this.args.mcpSdkReference
                                            })
                                        ],
                                        body: ts.codeblock((writer) => {
                                            writer.write("return ");
                                            writer.writeNodeStatement(
                                                new MethodInvocationNode({
                                                    on: ts.codeblock("server"),
                                                    method: "tool",
                                                    arguments_: [
                                                        ts.TypeLiteral.string(this.toolName),
                                                        ...(this.toolDescription
                                                            ? [ts.TypeLiteral.string(this.toolDescription)]
                                                            : []),
                                                        ...(hasAnyParams ? [ts.codeblock(writeParams)] : []),
                                                        new FunctionNode({
                                                            async: true,
                                                            parameters: [
                                                                new FunctionParameterNode({
                                                                    name: "params"
                                                                })
                                                            ],
                                                            body: ts.codeblock(writeBody)
                                                        })
                                                    ]
                                                })
                                            );
                                        })
                                    })
                                }
                            ]
                        })
                    );
                })
            })
        );
    }

    private getPartsFromPath() {
        const schemaPrefix = this.args.service.name.fernFilepath.allParts
            .map((part) => part.pascalCase.safeName)
            .join("");
        return this.args.endpoint.path.parts.map((part) => ({
            key: part.pathParameter,
            value: `${schemaPrefix}${this.capitalize(part.pathParameter)}`
        }));
    }

    private capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
