import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { AliasTypeDeclaration, TypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExportDefaultNode, typeReferenceMapper } from "../ast";

export class AliasGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly zodReference: ts.Reference;
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly aliasDeclaration: AliasTypeDeclaration
    ) {
        super(context);
        this.zodReference = ts.reference({
            name: "z",
            importFrom: { type: "default", moduleName: "zod" }
        });
        this.schemaVariableName = this.context.project.builder.getSchemaVariableName(
            this.typeDeclaration.name.name,
            this.typeDeclaration.name.fernFilepath
        );
    }

    public doGenerate(): TypescriptMcpFile {
        return new TypescriptMcpFile({
            node: ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    new ExportDefaultNode({
                        initializer: new ZodAliasNode({
                            zodReference: this.zodReference,
                            typeReference: this.aliasDeclaration.aliasOf
                        })
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

export declare namespace ZodAliasNode {
    interface Args {
        zodReference: ts.Reference;
        typeReference: TypeReference;
    }
}

export class ZodAliasNode extends ts.AstNode {
    public constructor(private readonly args: ZodAliasNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(`.${typeReferenceMapper(this.args.typeReference)}`);
    }
}
