import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExportDefaultNode, typeReferenceMapper } from "../utils";

export class ObjectGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly typeDeclaration: TypeDeclaration;
    constructor(
        context: ModelGeneratorContext,
        typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
    ) {
        super(context);
        this.typeDeclaration = typeDeclaration;
    }

    public doGenerate(): TypescriptMcpFile {
        const schemaVariableName = this.context.project.builder.getSchemaVariableName(
            this.typeDeclaration.name.name,
            this.typeDeclaration.name.fernFilepath
        );
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeLine("import z from \"zod\";");
                writer.newLine();
                writer.writeNodeStatement(
                    new ExportDefaultNode({
                        initializer: ts.codeblock((writer) => {
                            const object = `{\n${this.objectDeclaration.properties
                                .map(
                                    (field) =>
                                        `    ${field.name.name.camelCase.safeName}: z.${typeReferenceMapper(field.valueType)},\n`
                                )
                                .join("")}}`;
                            writer.write(`z.object(${object})`);
                        })
                    })
                );
            }),
            directory: this.getFilepath(),
            filename: `${schemaVariableName}.ts`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("");
    }
}
