import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ExportNode, FileGenerator, TypescriptFile, ZodTypeMapper } from "@fern-api/typescript-mcp-base";

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
        this.schemaVariableName = this.context.project.builder.getSchemaVariableName(
            this.typeDeclaration.name.name,
            this.typeDeclaration.name.fernFilepath
        );
    }

    public doGenerate(): TypescriptFile {
        return new TypescriptFile({
            node: ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    new ExportNode({
                        initializer: new ZodUnionNode({
                            zodReference: this.context.project.builder.zodReference,
                            unionDeclaration: this.unionDeclaration,
                            zodTypeMapper: this.context.zodTypeMapper
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

export declare namespace ZodUnionNode {
    interface Args {
        zodReference: ts.Reference;
        unionDeclaration: UnionTypeDeclaration;
        zodTypeMapper: ZodTypeMapper;
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
            writer.write(`"${this.args.zodTypeMapper.convertSingleUnionType(type)}",`);
            writer.newLine();
        }
        writer.dedent();
        writer.write("])");
    }
}
