import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ReExportAsNamedNode } from "../ast";

export class IndexGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly schemaVariableNames: string[];

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclarations: TypeDeclaration[]
    ) {
        super(context);
        this.schemaVariableNames = this.typeDeclarations.map((typeDeclaration) =>
            this.context.project.builder.getSchemaVariableName(
                typeDeclaration.name.name,
                typeDeclaration.name.fernFilepath
            )
        );
    }

    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                this.schemaVariableNames.forEach((schemaVariableName) => {
                    writer.writeNodeStatement(
                        new ReExportAsNamedNode({
                            name: schemaVariableName,
                            importFrom: { type: "default", moduleName: schemaVariableName }
                        })
                    );
                });
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
