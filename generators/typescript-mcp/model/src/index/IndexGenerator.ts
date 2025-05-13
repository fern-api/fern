import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ReExportAsNamedNode } from "../utils";

export class IndexGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly typeDeclarations: TypeDeclaration[];
    constructor(context: ModelGeneratorContext, typeDeclarations: TypeDeclaration[]) {
        super(context);
        this.typeDeclarations = typeDeclarations;
    }

    public doGenerate(): TypescriptMcpFile {
        const schemaNames = this.typeDeclarations.map((typeDeclaration) =>
            this.context.project.builder.getSchemaVariableName(
                typeDeclaration.name.name,
                typeDeclaration.name.fernFilepath
            )
        );
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                schemaNames.forEach((schemaName) => {
                    writer.writeNodeStatement(
                        new ReExportAsNamedNode({
                            name: schemaName,
                            importFrom: { type: "default", moduleName: schemaName }
                        })
                    );
                });
            }),
            directory: this.getFilepath(),
            filename: "index.ts",
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("");
    }
}
