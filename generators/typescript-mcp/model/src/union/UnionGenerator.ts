import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ArrayLiteralNode, ExportNode, FileGenerator, TypescriptFile } from "@fern-api/typescript-mcp-base";

import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class UnionGenerator extends FileGenerator<TypescriptFile, TypescriptCustomConfigSchema, ModelGeneratorContext> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
    ) {
        super(context);
        this.schemaVariableName = this.context.project.builder.getSchemaVariableName(this.typeDeclaration);
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                this.unionDeclaration.types.forEach((type) => {
                    const _type = this.context.zodTypeMapper.convertSingleUnionType(type);
                    const named = this.context.zodTypeMapper.HACKExtractNamed(_type);
                    for (const name of named) {
                        writer.writeLine(`import ${name} from '../schemas/${name}';`);
                    }
                });
                writer.writeNodeStatement(
                    new ExportNode({
                        initializer: ts.invokeMethod({
                            on: this.context.project.builder.zodReference,
                            method: "union",
                            arguments_: [
                                new ArrayLiteralNode({
                                    values: this.unionDeclaration.types.map((type) =>
                                        ts.codeblock((writer) => {
                                            const _type = this.context.zodTypeMapper.convertSingleUnionType(type);
                                            writer.writeLine(_type.replace(/schemas\./g, ""));
                                            // writer.write(this.context.zodTypeMapper.convertSingleUnionType(type));
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
