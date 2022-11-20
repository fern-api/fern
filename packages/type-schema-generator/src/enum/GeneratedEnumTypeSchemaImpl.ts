import { EnumTypeDeclaration } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { GeneratedEnumTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedEnumTypeSchemaImpl
    extends AbstractGeneratedTypeSchema<EnumTypeDeclaration>
    implements GeneratedEnumTypeSchema
{
    protected override getSchema(context: TypeSchemaContext): Zurg.Schema {
        return context.coreUtilities.zurg.enum(this.shape.values.map((value) => value.value));
    }

    protected override generateRawTypeDeclaration(_context: TypeSchemaContext, module: ModuleDeclaration): void {
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
