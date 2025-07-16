import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { BaseContext, GeneratedEnumTypeSchema } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { EnumTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedEnumTypeSchemaImpl<Context extends BaseContext>
    extends AbstractGeneratedTypeSchema<EnumTypeDeclaration, Context>
    implements GeneratedEnumTypeSchema<Context>
{
    public readonly type = "enum";

    protected override buildSchema(context: Context): Zurg.Schema {
        return context.coreUtilities.zurg.enum(this.shape.values.map((value) => value.name.wireValue));
    }

    protected override generateRawTypeDeclaration(_context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.shape.values.map((value) =>
                        ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(value.name.wireValue))
                    )
                )
            ),
            isExported: true
        });
    }
}
