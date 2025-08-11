import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedUndiscriminatedUnionTypeSchema, ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { UndiscriminatedUnionTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedUndiscriminatedUnionTypeSchemaImpl<Context extends ModelContext>
    extends AbstractGeneratedTypeSchema<UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionTypeSchema<Context>
{
    public readonly type = "undiscriminatedUnion";

    protected override buildSchema(context: Context): Zurg.Schema {
        return context.coreUtilities.zurg.undiscriminatedUnion(
            this.shape.members.map((member) => context.typeSchema.getSchemaOfTypeReference(member.type))
        );
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.shape.members.map((value) => context.typeSchema.getReferenceToRawType(value.type).typeNode)
                )
            ),
            isExported: true
        });
    }
}
