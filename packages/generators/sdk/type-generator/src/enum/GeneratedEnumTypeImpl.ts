import { EnumTypeDeclaration, EnumValue, ExampleType } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, getWriterForMultiLineUnionType, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedEnumType, GetReferenceOpts, WithBaseContextMixin } from "@fern-typescript/contexts";
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

        maybeAddDocs(type, this.getDocs(context));

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
                                        ts.factory.createIdentifier(this.getEnumValueName(value)),
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

    public buildExample(example: ExampleType, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "enum") {
            throw new Error("Example is not for an enum");
        }

        const enumValue = this.shape.values.find((enumValue) => enumValue.nameV2.wireValue === example.wireValue);
        if (enumValue == null) {
            throw new Error("No enum with wire value: " + example.wireValue);
        }
        return ts.factory.createPropertyAccessExpression(
            this.getReferenceToSelf(context).getExpression(opts),
            this.getEnumValueName(enumValue)
        );
    }

    private getEnumValueName(enumValue: EnumValue): string {
        return enumValue.nameV2.name.unsafeName.pascalCase;
    }
}
