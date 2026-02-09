import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ArrayLiteralNode, ExportNode, FileGenerator, TypescriptFile } from "@fern-api/typescript-mcp-base";
import { FernIr } from "@fern-fern/ir-sdk";

import { ModelGeneratorContext } from "../ModelGeneratorContext.js";

export class UnionGenerator extends FileGenerator<TypescriptFile, TypescriptCustomConfigSchema, ModelGeneratorContext> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: FernIr.TypeDeclaration,
        private readonly unionDeclaration: FernIr.UnionTypeDeclaration
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
                            method: "union",
                            arguments_: [
                                new ArrayLiteralNode({
                                    values: this.unionDeclaration.types.map((type) =>
                                        ts.invokeMethod({
                                            on: this.context.project.builder.zodReference,
                                            method: this.context.zodTypeMapper.convertSingleUnionType(type),
                                            arguments_: []
                                        })
                                    )
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
