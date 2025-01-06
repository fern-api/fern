import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { Zurg, getTextOfTsNode } from "@fern-typescript/commons";
import { GeneratedObjectTypeSchema, ModelContext } from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { ObjectTypeDeclaration } from "@fern-fern/ir-sdk/api";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema";

export class GeneratedObjectTypeSchemaImpl<Context extends ModelContext>
    extends AbstractGeneratedTypeSchema<ObjectTypeDeclaration, Context>
    implements GeneratedObjectTypeSchema<Context>
{
    public readonly type = "object";

    protected override buildSchema(context: Context): Zurg.Schema {
        const generatedType = this.getGeneratedType();
        if (generatedType.type !== "object") {
            throw new Error("Type is not an object: " + this.typeName);
        }

        const properties = this.shape.properties.map(
            (property): Zurg.Property => ({
                key: {
                    raw: property.name.wireValue,
                    parsed: generatedType.getPropertyKey({ propertyWireKey: property.name.wireValue })
                },
                value: context.typeSchema.getSchemaOfTypeReference(property.valueType)
            })
        );

        let schema = (
            this.noOptionalProperties
                ? context.coreUtilities.zurg.objectWithoutOptionalProperties
                : context.coreUtilities.zurg.object
        )(properties);

        for (const extension of this.shape.extends) {
            schema = schema.extend(context.typeSchema.getSchemaOfNamedType(extension, { isGeneratingSchema: true }));
        }

        if (this.shape.extraProperties) {
            schema = schema.passthrough();
        }

        return schema;
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        module.addInterface({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            extends: this.shape.extends.map((extension) =>
                getTextOfTsNode(context.typeSchema.getReferenceToRawNamedType(extension).getTypeNode())
            ),
            properties: [
                ...this.shape.properties.map((property) => {
                    const type = context.typeSchema.getReferenceToRawType(property.valueType);
                    return {
                        name: `"${property.name.wireValue}"`,
                        type: getTextOfTsNode(type.typeNodeWithoutUndefined),
                        hasQuestionToken: type.isOptional
                    };
                }),
                ...(this.shape.extraProperties
                    ? [
                          {
                              name: "[key: string]",
                              type: "any"
                          }
                      ]
                    : [])
            ],
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
        return context.coreUtilities.zurg.ObjectSchema._getReferenceToType({ rawShape, parsedShape });
    }
}
