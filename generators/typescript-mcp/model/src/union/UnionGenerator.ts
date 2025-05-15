import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { TypeDeclaration, UnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExportDefaultNode, singleUnionTypeMapper } from "../ast";

export class UnionGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly zodReference: ts.Reference;
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly unionDeclaration: UnionTypeDeclaration
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
                        initializer: new ZodUnionNode({
                            zodReference: this.zodReference,
                            unionDeclaration: this.unionDeclaration
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

export declare namespace ZodUnionNode {
    interface Args {
        zodReference: ts.Reference;
        unionDeclaration: UnionTypeDeclaration;
    }
}

// TODO: test this thoroughly
export class ZodUnionNode extends ts.AstNode {
    public constructor(private readonly args: ZodUnionNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(".union([");
        writer.newLine();
        writer.indent();
        for (const type of this.args.unionDeclaration.types) {
            writer.write(`"${singleUnionTypeMapper(type)}",`);
            writer.newLine();
        }
        writer.dedent();
        writer.write("])");
    }
}
