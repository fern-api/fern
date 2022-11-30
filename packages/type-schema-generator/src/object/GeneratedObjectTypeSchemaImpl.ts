import { ObjectTypeDeclaration } from "@fern-fern/ir-model/types";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { GeneratedObjectTypeSchema, TypeSchemaContext } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedObjectTypeSchemaImpl<Context extends TypeSchemaContext>
    extends AbstractGeneratedTypeSchema<ObjectTypeDeclaration, Context>
    implements GeneratedObjectTypeSchema<Context>
{
    public readonly type = "object";

    protected override getSchema(context: Context): Zurg.Schema {
        const generatedType = this.getGeneratedType();
        if (generatedType.type !== "object") {
            throw new Error("Type is not an object: " + this.typeName);
        }

        let schema = context.base.coreUtilities.zurg.object(
            this.shape.properties.map((property) => ({
                key: {
                    raw: property.nameV2.wireValue,
                    parsed: generatedType.getPropertyKey(property),
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType),
            }))
        );

        for (const extension of this.shape.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension));
        }

        return schema;
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        module.addInterface({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            extends: this.shape.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            ),
            properties: this.shape.properties.map((property) => {
                const type = context.typeSchema.getReferenceToRawType(property.valueType);
                return {
                    name: `"${property.nameV2.wireValue}"`,
                    type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                    hasQuestionToken: type.isOptional,
                };
            }),
        });
    }

    protected override getReferenceToSchemaType({
        context,
        rawShape,
        parsedShape,
    }: {
        context: Context;
        rawShape: ts.TypeNode;
        parsedShape: ts.TypeNode;
    }): ts.TypeNode {
        return context.base.coreUtilities.zurg.ObjectSchema._getReferenceToType({ rawShape, parsedShape });
    }
}
