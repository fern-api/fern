import { TypeReference } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { GeneratedAliasTypeSchema, TypeSchemaContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedAliasTypeSchemaImpl<Context extends TypeSchemaContext>
    extends AbstractGeneratedTypeSchema<TypeReference, Context>
    implements GeneratedAliasTypeSchema<Context>
{
    public readonly type = "alias";

    protected override buildSchema(context: Context): Zurg.Schema {
        const schemaOfAlias = context.typeSchema.getSchemaOfTypeReference(this.shape);
        const generatedAliasType = this.getGeneratedType();
        if (generatedAliasType.type !== "alias") {
            throw new Error("Type is not an alias: " + this.typeName);
        }
        if (!generatedAliasType.isBranded) {
            return schemaOfAlias;
        }

        const VALUE_PARAMETER_NAME = "value";
        return schemaOfAlias.transform({
            newShape: undefined,
            parse: generatedAliasType.getReferenceToCreator(context),
            json: ts.factory.createArrowFunction(
                undefined,
                undefined,
                [
                    ts.factory.createParameterDeclaration(
                        undefined,
                        undefined,
                        undefined,
                        VALUE_PARAMETER_NAME,
                        undefined,
                        undefined
                    ),
                ],
                undefined,
                undefined,
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            ),
        });
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.shape).typeNode),
        });
    }
}
