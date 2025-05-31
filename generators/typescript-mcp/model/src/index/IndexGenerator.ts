import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, ReExportAsNamedNode, TypescriptFile } from "@fern-api/typescript-mcp-base";

import { HttpService, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class IndexGenerator extends FileGenerator<TypescriptFile, TypescriptCustomConfigSchema, ModelGeneratorContext> {
    private readonly schemaVariableNames: string[];

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclarations: TypeDeclaration[],
        private readonly services: HttpService[]
    ) {
        super(context);
        this.schemaVariableNames = this.typeDeclarations.map((typeDeclaration) =>
            this.context.project.builder.getSchemaVariableName(typeDeclaration)
        );
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                this.schemaVariableNames.forEach((schemaVariableName) => {
                    writer.writeNodeStatement(
                        new ReExportAsNamedNode({
                            name: schemaVariableName,
                            importFrom: { type: "default", moduleName: schemaVariableName }
                        })
                    );
                });
                const services = Object.values(this.services);
                for (const service of services) {
                    const endpoints = Object.values(service.endpoints);
                    for (const endpoint of endpoints) {
                        const schemaVariableName =
                            this.context.project.builder.getSchemaVariableNameForEndpoint(endpoint);
                        if (schemaVariableName) {
                            writer.writeNodeStatement(
                                new ReExportAsNamedNode({
                                    name: schemaVariableName,
                                    importFrom: { type: "default", moduleName: schemaVariableName }
                                })
                            );
                        }
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
