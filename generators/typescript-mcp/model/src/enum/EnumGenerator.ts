import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { EnumTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ExportDefaultNode } from "../ast";

export class EnumGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly zodReference: ts.Reference;
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly enumDeclaration: EnumTypeDeclaration
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
                        initializer: new ZodEnumNode({
                            zodReference: this.zodReference,
                            enumDeclaration: this.enumDeclaration
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

export declare namespace ZodEnumNode {
    interface Args {
        zodReference: ts.Reference;
        enumDeclaration: EnumTypeDeclaration;
    }
}

export class ZodEnumNode extends ts.AstNode {
    public constructor(private readonly args: ZodEnumNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(".enum([");
        writer.newLine();
        writer.indent();
        for (const value of this.args.enumDeclaration.values) {
            writer.write(`"${value.name.name.originalName}",`);
            writer.newLine();
        }
        writer.dedent();
        writer.write("])");
    }
}
