import { ExampleTypeShape, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { BrandedGeneratedAliasType, ModelContext } from "@fern-typescript/contexts";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedBrandedStringAliasImpl<Context extends ModelContext>
    extends AbstractGeneratedType<TypeReference, Context>
    implements BrandedGeneratedAliasType<Context>
{
    public readonly type = "alias";
    public readonly isBranded = true;

    public writeToFile(context: Context): void {
        this.writeTypeAlias(context);
        this.writeBuilder(context);
    }

    public getReferenceToCreator(context: Context, opts?: GetReferenceOpts): ts.Expression {
        return this.getReferenceToSelf(context).getExpression(opts);
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "alias") {
            throw new Error("Example is not for an alias");
        }
        return ts.factory.createCallExpression(this.getReferenceToCreator(context, opts), undefined, [
            context.type.getGeneratedExample(example.value).build(context, opts),
        ]);
    }

    private writeTypeAlias(context: Context) {
        const referenceToAliasedType = context.type.getReferenceToType(this.shape).typeNode;
        const typeAlias = context.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(
                ts.factory.createIntersectionTypeNode([
                    referenceToAliasedType,
                    ts.factory.createTypeLiteralNode([
                        ts.factory.createPropertySignature(
                            undefined,
                            this.getStringBrand(),
                            undefined,
                            ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
                        ),
                    ]),
                ])
            ),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.getDocs(context));
    }

    private writeBuilder(context: Context) {
        const VALUE_PARAMETER_NAME = "value";
        context.sourceFile.addFunction({
            name: this.typeName,
            parameters: [
                {
                    name: VALUE_PARAMETER_NAME,
                    type: getTextOfTsKeyword(ts.SyntaxKind.StringKeyword),
                },
            ],
            returnType: getTextOfTsNode(this.getReferenceToSelf(context).getTypeNode()),
            statements: [
                getTextOfTsNode(
                    ts.factory.createReturnStatement(
                        ts.factory.createAsExpression(
                            ts.factory.createAsExpression(
                                ts.factory.createIdentifier(VALUE_PARAMETER_NAME),
                                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
                            ),
                            this.getReferenceToSelf(context).getTypeNode()
                        )
                    )
                ),
            ],
            isExported: true,
        });
    }

    private getStringBrand(): string {
        return [...this.fernFilepath.packagePath.map((part) => part.camelCase.unsafeName), this.typeName].join("_");
    }
}
