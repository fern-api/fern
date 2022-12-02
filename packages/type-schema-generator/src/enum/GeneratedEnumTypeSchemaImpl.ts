import { EnumTypeDeclaration } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { GeneratedEnumTypeSchema, WithBaseContextMixin } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedEnumTypeSchemaImpl<Context extends WithBaseContextMixin>
    extends AbstractGeneratedTypeSchema<EnumTypeDeclaration, Context>
    implements GeneratedEnumTypeSchema<Context>
{
    public readonly type = "enum";

    protected override buildSchema(context: Context): Zurg.Schema {
        return context.base.coreUtilities.zurg.enum(this.shape.values.map((value) => value.value));
    }

    protected override generateRawTypeDeclaration(_context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.shape.values.map((value) =>
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.value))
                    )
                )
            ),
        });
    }
}
