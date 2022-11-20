import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsKeyword, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { NotBrandedGeneratedAliasType, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedAliasTypeImpl
    extends AbstractGeneratedType<AliasTypeDeclaration>
    implements NotBrandedGeneratedAliasType
{
    public readonly isBranded = false;

    public writeToFile(context: TypeContext): void {
        this.writeTypeAlias(context);
        this.writeConst(context);
    }

    private writeTypeAlias(context: TypeContext) {
        const typeAlias = context.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(context.getReferenceToType(this.shape.aliasOf).typeNode),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.typeDeclaration.docs);
    }

    private writeConst(context: TypeContext) {
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
}
