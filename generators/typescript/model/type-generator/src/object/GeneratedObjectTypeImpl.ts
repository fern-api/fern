import { ExampleTypeShape, ObjectProperty, ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-sdk/api";
import { GetReferenceOpts, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedObjectType, ModelContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedObjectTypeImpl<Context extends ModelContext>
    extends AbstractGeneratedType<ObjectTypeDeclaration, Context>
    implements GeneratedObjectType<Context>
{
    public readonly type = "object";

    public writeToFile(context: Context): void {
        const interfaceNode = context.sourceFile.addInterface({
            name: this.typeName,
            properties: [
                ...this.shape.properties.map((property) => {
                    const value = context.type.getReferenceToType(property.valueType);
                    const propertyNode: OptionalKind<PropertySignatureStructure> = {
                        name: `"${this.getPropertyKeyFromProperty(property)}"`,
                        type: getTextOfTsNode(
                            this.noOptionalProperties ? value.typeNode : value.typeNodeWithoutUndefined
                        ),
                        hasQuestionToken: !this.noOptionalProperties && value.isOptional,
                        docs: property.docs != null ? [{ description: property.docs }] : undefined
                    };

                    return propertyNode;
                })
            ],
            isExported: true
        });

        maybeAddDocs(interfaceNode, this.getDocs(context));

        for (const extension of this.shape.extends) {
            interfaceNode.addExtends(getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode()));
        }
    }

    public getPropertyKey({ propertyWireKey }: { propertyWireKey: string }): string {
        const property = this.shape.properties.find((property) => property.name.wireValue === propertyWireKey);
        if (property == null) {
            throw new Error("Property does not exist: " + propertyWireKey);
        }
        return this.getPropertyKeyFromProperty(property);
    }

    private getPropertyKeyFromProperty(property: ObjectProperty): string {
        if (this.includeSerdeLayer && !this.retainOriginalCasing) {
            return property.name.name.camelCase.unsafeName;
        } else {
            return property.name.wireValue;
        }
    }

    public buildExample(example: ExampleTypeShape, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "object") {
            throw new Error("Example is not for an object");
        }

        return ts.factory.createObjectLiteralExpression(this.buildExampleProperties(example, context, opts), true);
    }

    public buildExampleProperties(
        example: ExampleTypeShape,
        context: Context,
        opts: GetReferenceOpts
    ): ts.ObjectLiteralElementLike[] {
        if (example.type !== "object") {
            throw new Error("Example is not for an object");
        }

        return example.properties.map((property) => {
            const originalTypeForProperty = context.type.getGeneratedType(property.originalTypeDeclaration);
            if (originalTypeForProperty.type === "union") {
                const propertyKey = originalTypeForProperty.getSinglePropertyKey({
                    name: property.name,
                    type: TypeReference.named({
                        ...property.originalTypeDeclaration,
                        default: undefined,
                        inline: undefined
                    })
                });
                return ts.factory.createPropertyAssignment(
                    propertyKey,
                    context.type.getGeneratedExample(property.value).build(context, opts)
                );
            }
            if (originalTypeForProperty.type !== "object") {
                throw new Error("Property does not come from an object");
            }
            const key = originalTypeForProperty.getPropertyKey({ propertyWireKey: property.name.wireValue });
            return ts.factory.createPropertyAssignment(
                key,
                context.type.getGeneratedExample(property.value).build(context, opts)
            );
        });
    }

    public getAllPropertiesIncludingExtensions(
        context: Context
    ): { propertyKey: string; wireKey: string; type: TypeReference }[] {
        return [
            ...this.shape.properties.map((property) => ({
                wireKey: property.name.wireValue,
                propertyKey: this.getPropertyKeyFromProperty(property),
                type: property.valueType
            })),
            ...this.shape.extends.flatMap((extension) => {
                const generatedType = context.type.getGeneratedType(extension);
                if (generatedType.type !== "object") {
                    throw new Error("Type extends non-object");
                }
                return generatedType.getAllPropertiesIncludingExtensions(context);
            })
        ];
    }
}
