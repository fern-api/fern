import { RelativeFilePath } from "@fern-api/fs-utils";
import { TypescriptCustomConfigSchema, ts } from "@fern-api/typescript-ast";
import { FileGenerator, TypescriptMcpFile } from "@fern-api/typescript-mcp-base";

import { ObjectTypeDeclaration, TypeDeclaration } from "@fern-fern/ir-sdk/api";

import { ModelGeneratorContext } from "../ModelGeneratorContext";
import { ZodAliasNode } from "../alias/AliasGenerator";
import { ExportDefaultNode } from "../ast";

export class ObjectGenerator extends FileGenerator<
    TypescriptMcpFile,
    TypescriptCustomConfigSchema,
    ModelGeneratorContext
> {
    private readonly zodReference: ts.Reference;
    private readonly schemaVariableName: string;
    constructor(
        context: ModelGeneratorContext,
        private readonly typeDeclaration: TypeDeclaration,
        private readonly objectDeclaration: ObjectTypeDeclaration
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
                        initializer: new ZodObjectNode({
                            zodReference: this.zodReference,
                            objectDeclaration: this.objectDeclaration
                        })
                    })
                );
            }),
            directory: this.getFilepath(),
            filename: `${this.schemaVariableName}.ts`,
            customConfig: this.context.customConfig
        });
    }

    protected getFilepath(): RelativeFilePath {
        return RelativeFilePath.of("");
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
