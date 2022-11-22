import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { BrandedGeneratedAliasType, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedBrandedStringAliasImpl
    extends AbstractGeneratedType<AliasTypeDeclaration>
    implements BrandedGeneratedAliasType
{
    public readonly type = "alias";
    public readonly isBranded = true;

    public writeToFile(context: TypeContext): void {
        this.writeTypeAlias(context);
        this.writeBuilder(context);
    }

    public getReferenceToCreator(context: TypeContext): ts.Expression {
        return context.getReferenceToNamedType(this.typeDeclaration.name).getExpression();
    }

    private writeTypeAlias(context: TypeContext) {
        const referenceToAliasedType = context.getReferenceToType(this.shape.aliasOf).typeNode;
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
        maybeAddDocs(typeAlias, this.typeDeclaration.docs);
    }

    private writeBuilder(context: TypeContext) {
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
        return [
            ...this.typeDeclaration.name.fernFilepathV2.slice(0, -1).map((part) => part.unsafeName.camelCase),
            this.typeName,
        ].join("_");
    }
}
