import { AliasTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { NotBrandedGeneratedAliasType, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedAliasTypeImpl<Context extends TypeContext>
    extends AbstractGeneratedType<AliasTypeDeclaration, Context>
    implements NotBrandedGeneratedAliasType<Context>
{
    public readonly type = "alias";
    public readonly isBranded = false;

    public writeToFile(context: Context): void {
        this.writeTypeAlias(context);
    }

    private writeTypeAlias(context: Context) {
        const typeAlias = context.base.sourceFile.addTypeAlias({
            name: this.typeName,
            type: getTextOfTsNode(context.type.getReferenceToType(this.shape.aliasOf).typeNode),
            isExported: true,
        });
        maybeAddDocs(typeAlias, this.docs);
    }
}
