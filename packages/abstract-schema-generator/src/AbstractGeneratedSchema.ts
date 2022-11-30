import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts, VariableDeclarationKind } from "ts-morph";

export declare namespace AbstractGeneratedSchema {
    export interface Init {
        typeName: string;
    }
}

export abstract class AbstractGeneratedSchema<Context extends WithBaseContextMixin> {
    public static RAW_TYPE_NAME = "Raw";

    protected typeName: string;

    constructor({ typeName }: AbstractGeneratedSchema.Init) {
        this.typeName = typeName;
    }

    public writeSchemaToFile(context: Context): void {
        context.base.sourceFile.addVariableStatement({
            isExported: true,
            declarationKind: VariableDeclarationKind.Const,
            declarations: [
                {
                    name: this.typeName,
                    type: getTextOfTsNode(
                        this.getReferenceToSchemaType({
                            context,
                            rawShape: this.getReferenceToRawShape(context),
                            parsedShape: this.getReferenceToParsedShape(context),
                        })
                    ),
                    initializer: getTextOfTsNode(this.getSchema(context).toExpression()),
                },
            ],
        });

        this.generateModule(context);
    }

    protected getReferenceToSchemaType({
        context,
        rawShape,
        parsedShape,
    }: {
        context: Context;
        rawShape: ts.TypeNode;
        parsedShape: ts.TypeNode;
    }): ts.TypeNode {
        return context.base.coreUtilities.zurg.Schema._getReferenceToType({ rawShape, parsedShape });
    }

    protected generateModule(context: Context): void {
        const module = context.base.sourceFile.addModule({
            name: this.getModuleName(),
            isExported: true,
            hasDeclareKeyword: true,
        });
        this.generateRawTypeDeclaration(context, module);
    }

    protected getReferenceToRawShape(_context: Context): ts.TypeNode {
        return ts.factory.createTypeReferenceNode(
            ts.factory.createQualifiedName(
                ts.factory.createIdentifier(this.getModuleName()),
                AbstractGeneratedSchema.RAW_TYPE_NAME
            )
        );
    }

    protected abstract generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void;
    protected abstract getReferenceToParsedShape(context: Context): ts.TypeNode;
    protected abstract getSchema(context: Context): Zurg.Schema;

    protected getModuleName(): string {
        return this.typeName;
    }
}
