import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ExportNode, FileGenerator, TypescriptFile } from "@fern-api/typescript-mcp-base";

import { AliasTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class AliasGenerator extends FileGenerator<TypescriptFile, TypescriptCustomConfigSchema, ModelGeneratorContext> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly aliasDeclaration: AliasTypeDeclaration
    ) {
        super(context);
        this.schemaVariableName = this.context.project.builder.getSchemaVariableName(this.typeDeclaration);
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                writer.writeLine("import z from 'zod';");
                const type = this.context.zodTypeMapper.convert({
                    reference: this.aliasDeclaration.aliasOf
                });
                const named = this.context.zodTypeMapper.HACKExtractNamed(type);
                for (const name of named) {
                    writer.writeLine(`import ${name} from '../schemas/${name}';`);
                }
                writer.writeNodeStatement(
                    new ExportNode({
                        initializer: ts.codeblock((writer) => {
                            writer.writeLine(type.replace(/schemas\./g, ""));
                            // writer.writeLine(
                            //     this.context.zodTypeMapper.convert({ reference: this.aliasDeclaration.aliasOf })
                            // );
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
