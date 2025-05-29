import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ExportNode, FileGenerator, ObjectLiteralNode, TypescriptFile } from "@fern-api/typescript-mcp-base";

import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class ObjectGenerator extends FileGenerator<
    TypescriptFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.schemaVariableName = this.context.project.builder.getSchemaVariableName(this.typeDeclaration);
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                this.objectDeclaration.properties.forEach((value) => {
                    const type = this.context.zodTypeMapper.convert({
                        reference: value.valueType
                    });
                    const named = this.context.zodTypeMapper.HACKExtractNamed(type);
                    for (const name of named) {
                        writer.writeLine(`import ${name} from '../schemas/${name}';`);
                    }
                });
                writer.writeNodeStatement(
                    new ExportNode({
                        initializer: ts.invokeMethod({
                            on: this.context.project.builder.zodReference,
                            method: "object",
                            arguments_: [
                                new ObjectLiteralNode({
                                    fields: this.objectDeclaration.properties.map((value) => ({
                                        name: value.name.name.snakeCase.safeName,
                                        value: ts.codeblock((writer) => {
                                            const type = this.context.zodTypeMapper.convert({
                                                reference: value.valueType
                                            });
                                            writer.writeLine(type.replace(/schemas\./g, ""));
                                            // writer.write(
                                            //     this.context.zodTypeMapper.convert({ reference: value.valueType })
                                            // );
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
