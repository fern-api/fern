import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ExportNode, FileGenerator, ObjectLiteralNode, TypescriptFile } from "@fern-api/typescript-mcp-base";

import { HttpEndpoint, ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";

export class EndpointGenerator extends FileGenerator<
    TypescriptFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly endpoint: HttpEndpoint
    ) {
        super(context);
        const schemaVariableName = context.project.builder.getSchemaVariableNameForEndpoint(this.endpoint);
        if (!schemaVariableName) {
            throw new Error(`No schema variable name found for endpoint ${this.endpoint.name}`);
        }
        this.schemaVariableName = schemaVariableName;
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                writer.writeLine("import z from 'zod';");
                const type = this.context.zodTypeMapper.convertEndpoint(this.endpoint);
                const named = this.context.zodTypeMapper.HACKExtractNamed(type);
                for (const name of named) {
                    writer.writeLine(`import ${name} from '../schemas/${name}';`);
                }
                writer.writeNodeStatement(
                    new ExportNode({
                        initializer: ts.codeblock((writer) => {
                            writer.writeLine(type.replace(/schemas\./g, ""));
                            // writer.writeLine(this.context.zodTypeMapper.convertEndpoint(this.endpoint));
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
