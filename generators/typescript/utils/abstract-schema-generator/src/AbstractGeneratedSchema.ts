import { Reference, Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, VariableDeclarationKind, ts } from "ts-morph";

export declare namespace AbstractGeneratedSchema {
    export interface Init {
        typeName: string;
    }
}

export abstract class AbstractGeneratedSchema<Context extends BaseContext> {
    protected static RAW_TYPE_NAME = "Raw";

    protected typeName: string;

    constructor({ typeName }: AbstractGeneratedSchema.Init) {
        this.typeName = typeName;
    }

    public writeSchemaToFile(context: Context): void {
        context.sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    type: getTextOfTsNode(
                        this.getReferenceToSchemaType({
                            context,
                            rawShape: this.getReferenceToRawShape(context),
                            parsedShape: this.getReferenceToParsedShape(context)
                        })
                    ),
                    initializer: getTextOfTsNode(this.buildSchema(context).toExpression())
                }
            ]
        });

        this.generateModule(context);
    }

    public getReferenceToZurgSchema(context: Context): Zurg.Schema {
        return context.coreUtilities.zurg.Schema._fromExpression(this.getReferenceToSchema(context).getExpression());
    }

    public getReferenceToRawShape(context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                this.getReferenceToSchema(context).getEntityName(),
                AbstractGeneratedSchema.RAW_TYPE_NAME
            )
        );
    }

    protected getReferenceToSchemaType({
        context,
        rawShape,
        parsedShape
    }: {
        context: Context;
        rawShape: ts.TypeNode;
        parsedShape: ts.TypeNode;
    }): ts.TypeNode {
        return context.coreUtilities.zurg.Schema._getReferenceToType({ rawShape, parsedShape });
    }

    protected generateModule(context: Context): void {
        const module = context.sourceFile.addModule({
            name: this.getModuleName(),
            isExported: true,
            hasDeclareKeyword: true
        });
        this.generateRawTypeDeclaration(context, module);
    }

    protected abstract getReferenceToSchema(context: Context): Reference;
    protected abstract generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void;
    protected abstract getReferenceToParsedShape(context: Context): ts.TypeNode;
    protected abstract buildSchema(context: Context): Zurg.Schema;

    protected getModuleName(): string {
        return this.typeName;
    }
}
