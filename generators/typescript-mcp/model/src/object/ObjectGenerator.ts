import { RelativeFilePath, join } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { ExportNode, FileGenerator, TypescriptFile } from "@fern-api/typescript-mcp-base";

import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ZodAliasNode } from "../alias/AliasGenerator";

export class ObjectGenerator extends FileGenerator<
    TypescriptFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly schemaVariableName: string;

    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
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
                        initializer: new ZodObjectNode({
                            zodReference: this.context.project.builder.zodReference,
                            objectDeclaration: this.objectDeclaration
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

export declare namespace ZodObjectNode {
    interface Args {
        zodReference: ts.Reference;
        objectDeclaration: ObjectTypeDeclaration;
    }
}

export class ZodObjectNode extends ts.AstNode {
    public constructor(private readonly args: ZodObjectNode.Args) {
        super();
    }

    public write(writer: ts.Writer) {
        writer.writeNode(this.args.zodReference);
        writer.write(".object({");
        writer.newLine();
        writer.indent();
        for (const property of this.args.objectDeclaration.properties) {
            writer.write(`${property.name.name.camelCase.safeName}: `);
            writer.writeNode(
                new ZodAliasNode({
                    zodReference: this.args.zodReference,
                    typeReference: property.valueType
                })
            );
            writer.write(",");
            writer.newLine();
        }
        writer.dedent();
        writer.write("})");
    }
}
