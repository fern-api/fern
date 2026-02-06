import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ExportNode, FileGenerator, ObjectLiteralNode, TypescriptFile } from "@fern-api/typescript-mcp-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class ObjectGenerator extends FileGenerator<
    TypescriptFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: FernIr.TypeDeclaration,
        private readonly objectDeclaration: FernIr.ObjectTypeDeclaration
    ) {
        super(context);
        this.schemaVariableName = this.context.project.builder.getSchemaVariableName(
            this.typeDeclaration.name.name,
            this.typeDeclaration.name.fernFilepath
        );
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    new ExportNode({
                        initializer: ts.invokeMethod({
                            on: this.context.project.builder.zodReference,
                            method: "object",
                            arguments_: [
                                new ObjectLiteralNode({
                                    fields: this.objectDeclaration.properties.map((value) => ({
                                        name: value.name.name.camelCase.safeName,
                                        value: ts.invokeMethod({
                                            on: this.context.project.builder.zodReference,
                                            method: this.context.zodTypeMapper.convert({ reference: value.valueType }),
                                            arguments_: []
                                        })
                                    }))
                                })
                            ]
                        }),
                        default: true
                    })
                );
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
        return `${this.schemaVariableName}.ts`;
    }

    protected getFilepath(): RelativeFilePath {
        return join(this.getDirectory(), RelativeFilePath.of(this.getFilename()));
    }
}
