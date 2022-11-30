import { ObjectProperty, ObjectTypeDeclaration } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { GeneratedObjectType, TypeContext } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure } from "ts-morph";
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
                        name: this.getPropertyKey(property),
                        type: getTextOfTsNode(value.typeNodeWithoutUndefined),
                        hasQuestionToken: value.isOptional,
                        docs: property.docs != null ? [{ description: property.docs }] : undefined,
                    };

                    return propertyNode;
                }),
            ],
            isExported: true,
        });

        maybeAddDocs(interfaceNode, this.docs);

        for (const extension of this.shape.extends) {
            interfaceNode.addExtends(getTextOfTsNode(context.type.getReferenceToNamedType(extension).getTypeNode()));
        }
    }

    public getPropertyKey(property: ObjectProperty): string {
        return property.nameV2.name.unsafeName.camelCase;
    }
}
