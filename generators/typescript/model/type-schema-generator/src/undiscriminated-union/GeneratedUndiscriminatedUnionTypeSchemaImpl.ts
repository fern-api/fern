import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { AbstractGeneratedSchema } from "@fern-typescript/abstract-schema-generator";
import { getPropertyKey, getTextOfTsNode, Zurg } from "@fern-typescript/commons";
import {
    GeneratedUndiscriminatedUnionType,
    GeneratedUndiscriminatedUnionTypeSchema,
    ModelContext
} from "@fern-typescript/contexts";
import { ModuleDeclaration, ts } from "ts-morph";

import { AbstractGeneratedTypeSchema } from "../AbstractGeneratedTypeSchema.js";

export class GeneratedUndiscriminatedUnionTypeSchemaImpl<Context extends ModelContext>
    extends AbstractGeneratedTypeSchema<FernIr.UndiscriminatedUnionTypeDeclaration, Context>
    implements GeneratedUndiscriminatedUnionTypeSchema<Context>
{
    public readonly type = "undiscriminatedUnion";

    protected override buildSchema(context: Context): Zurg.Schema {
        const generatedType = this.getGeneratedUndiscriminatedUnionType();
        return context.coreUtilities.zurg.undiscriminatedUnion(
            this.shape.members.map((member) => {
                if (!generatedType.appliesBasePropertiesToMember(context, member)) {
                    return context.typeSchema.getSchemaOfTypeReference(member.type);
                }
                const resolved = context.type.resolveTypeReference(member.type);
                if (resolved.type !== "named") {
                    throw new Error("Expected member to resolve to a named type: " + this.typeName);
                }
                const generatedMemberType = context.type.getGeneratedType(resolved.name);
                if (generatedMemberType.type !== "object") {
                    throw new Error("Expected member to resolve to an object type: " + this.typeName);
                }
                const memberWireKeys = new Set(
                    generatedMemberType.getAllPropertiesIncludingExtensions(context).map(({ wireKey }) => wireKey)
                );
                const basePropertySchemas = (this.shape.baseProperties ?? [])
                    .filter((property) => !memberWireKeys.has(getWireValue(property.name)))
                    .map(
                        (property): Zurg.Property => ({
                            key: {
                                raw: getWireValue(property.name),
                                parsed: generatedType.getBasePropertyKey({
                                    propertyWireKey: getWireValue(property.name)
                                })
                            },
                            value: context.typeSchema.getSchemaOfTypeReference(property.valueType)
                        })
                    );
                return (
                    this.noOptionalProperties
                        ? context.coreUtilities.zurg.objectWithoutOptionalProperties
                        : context.coreUtilities.zurg.object
                )(basePropertySchemas).extend(
                    context.typeSchema.getSchemaOfNamedType(resolved.name, { isGeneratingSchema: true })
                );
            })
        );
    }

    protected override generateRawTypeDeclaration(context: Context, module: ModuleDeclaration): void {
        const generatedType = this.getGeneratedUndiscriminatedUnionType();
        const baseRawType = ts.factory.createTypeLiteralNode(
            (this.shape.baseProperties ?? []).map((property) => {
                const type = context.typeSchema.getReferenceToRawType(property.valueType);
                return ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier(getPropertyKey(getWireValue(property.name))),
                    type.isOptional ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
                    type.typeNodeWithoutUndefined
                );
            })
        );
        module.addTypeAlias({
            name: AbstractGeneratedSchema.RAW_TYPE_NAME,
            type: getTextOfTsNode(
                ts.factory.createUnionTypeNode(
                    this.shape.members.map((member) => {
                        const memberNode = context.typeSchema.getReferenceToRawType(member.type).typeNode;
                        return generatedType.appliesBasePropertiesToMember(context, member)
                            ? ts.factory.createParenthesizedType(
                                  ts.factory.createIntersectionTypeNode([memberNode, baseRawType])
                              )
                            : memberNode;
                    })
                )
            ),
            isExported: true
        });
    }

    private getGeneratedUndiscriminatedUnionType(): GeneratedUndiscriminatedUnionType<Context> {
        const generatedType = this.getGeneratedType();
        if (generatedType.type !== "undiscriminatedUnion") {
            throw new Error("Type is not an undiscriminated union: " + this.typeName);
        }
        return generatedType;
    }
}
