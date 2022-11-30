import { EnumTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedEnumType, WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ts, VariableDeclarationKind } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedEnumTypeImpl<Context extends WithBaseContextMixin>
    extends AbstractGeneratedType<EnumTypeDeclaration, Context>
    implements GeneratedEnumType<Context>
{
    public readonly type = "enum";

    public writeToFile(context: Context): void {
        const type = context.base.sourceFile.addTypeAlias({
            name: this.typeName,
            isExported: true,
            type: getWriterForMultiLineUnionType(
                this.shape.values.map((value) => ({
                    docs: value.docs,
                    node: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.nameV2.wireValue)),
                }))
            ),
        });

        maybeAddDocs(type, this.docs);

        context.base.sourceFile.addVariableStatement({
            declarationKind: VariableDeclarationKind.Const,
            isExported: true,
            declarations: [
                {
                    name: this.typeName,
                    initializer: getTextOfTsNode(
                        ts.factory.createAsExpression(
                            ts.factory.createObjectLiteralExpression(
                                this.shape.values.map((value) =>
                                    ts.factory.createPropertyAssignment(
                                        ts.factory.createIdentifier(value.nameV2.name.unsafeName.pascalCase),
                                        ts.factory.createStringLiteral(value.nameV2.wireValue)
                                    )
                                ),
                                true
                            ),
                            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier("const"))
                        )
                    ),
                },
            ],
        });
    }
}
