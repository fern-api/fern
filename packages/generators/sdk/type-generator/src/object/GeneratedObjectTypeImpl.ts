import { ExampleType, ObjectTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedObjectType, GetReferenceOpts, TypeContext } from "@fern-typescript/contexts";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { AbstractGeneratedType } from "../AbstractGeneratedType";

export class GeneratedObjectTypeImpl<Context extends TypeContext>
    extends AbstractGeneratedType<ObjectTypeDeclaration, Context>
    implements GeneratedObjectType<Context>
{
    public readonly type = "object";

    public writeToFile(context: Context): void {
        const interfaceNode = context.base.sourceFile.addInterface({
            name: this.typeName,
            properties: [
                ...this.shape.properties.map((property) => {
                    const value = context.type.getReferenceToType(property.valueType);
                    const propertyNode: OptionalKind<PropertySignatureStructure> = {
                        name: this.getPropertyKey({ propertyWireKey: property.nameV2.wireValue }),
                        type: getTextOfTsNode(value.typeNodeWithoutUndefined),
                        hasQuestionToken: value.isOptional,
                        docs: property.docs != null ? [{ description: property.docs }] : undefined,
                    };

                    return propertyNode;
                }),
            ],
            isExported: true,
        });

        maybeAddDocs(interfaceNode, this.getDocs(context));

        for (const extension of this.shape.extends) {
            interfaceNode.addExtends(getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode()));
        }
    }

    public getPropertyKey({ propertyWireKey }: { propertyWireKey: string }): string {
        const property = this.shape.properties.find((property) => property.nameV2.wireValue === propertyWireKey);
        if (property == null) {
            throw new Error("Property does not exist: " + propertyWireKey);
        }
        return property.nameV2.name.unsafeName.camelCase;
    }

    public buildExample(example: ExampleType, context: Context, opts: GetReferenceOpts): ts.Expression {
        if (example.type !== "object") {
            throw new Error("Example is not for an object");
        }

        return ts.factory.createObjectLiteralExpression(
            example.properties.map((property) => {
                const originalTypeForProperty = context.type.getGeneratedType(property.originalTypeDeclaration);
                if (originalTypeForProperty.type !== "object") {
                    throw new Error("Property does not come from an object");
                }
                const key = originalTypeForProperty.getPropertyKey({ propertyWireKey: property.wireKey });
                return ts.factory.createPropertyAssignment(
                    key,
                    context.type.getGeneratedExample(property.value).build(context, opts)
                );
            }),
            true
        );
    }
}
