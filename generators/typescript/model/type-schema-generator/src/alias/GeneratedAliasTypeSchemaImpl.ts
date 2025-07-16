import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedAliasTypeSchema, ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { AliasTypeDeclaration, ShapeType } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedAliasTypeSchemaImpl<Context extends ModelContext>
    extends AbstractGeneratedTypeSchema<AliasTypeDeclaration, Context>
    implements GeneratedAliasTypeSchema<Context>
{
    public readonly type = "alias";

    protected override buildSchema(context: Context): Zurg.Schema {
        const schemaOfAlias = context.typeSchema.getSchemaOfTypeReference(this.shape.aliasOf);
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
            transform: generatedAliasType.getReferenceToCreator(context),
            untransform: ts.factory.createArrowFunction(
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
                    )
                ],
                undefined,
                undefined,
                ts.factory.createIdentifier(VALUE_PARAMETER_NAME)
            )
        });
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(context.typeSchema.getReferenceToRawType(this.shape.aliasOf).typeNode),
            isExported: true
        });
    }

    protected override getReferenceToSchemaType({
        context,
        rawShape,
        parsedShape
    }: {
        context: Context;
        rawShape: ts.TypeNode;
        parsedShape: ts.TypeNode;
    }): ts.TypeNode {
        if (this.shape.resolvedType.type === "named" && this.shape.resolvedType.shape === ShapeType.Object) {
            return context.coreUtilities.zurg.ObjectSchema._getReferenceToType({ rawShape, parsedShape });
        } else {
            return context.coreUtilities.zurg.Schema._getReferenceToType({ rawShape, parsedShape });
        }
    }
}
