import { ObjectTypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { getPropertyKey, getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";

export function generateObjectType({
    typeName,
    docs,
    file,
    shape,
    additionalProperties = {},
}: {
    file: SdkFile;
    docs: string | null | undefined;
    typeName: string;
    shape: ObjectTypeDeclaration;
    additionalProperties?: Record<string, ts.TypeNode>;
}): void {
    const node = file.sourceFile.addInterface({
        name: typeName,
        extends: shape.extends
            .map((typeName) => file.getReferenceToType(TypeReference.named(typeName)).typeNode)
            .map(getTextOfTsNode),
        properties: [
            ...Object.entries(additionalProperties).map(
                ([name, value]): OptionalKind<PropertySignatureStructure> => ({
                    name,
                    type: getTextOfTsNode(value),
                })
            ),
            ...shape.properties.map((field) => {
                const referenceToProperty = file.getReferenceToType(field.valueType);
                const property: OptionalKind<PropertySignatureStructure> = {
                    name: getPropertyKey(field.name.wireValue),
                    type: getTextOfTsNode(
                        referenceToProperty.isOptional
                            ? referenceToProperty.typeNodeWithoutUndefined
                            : referenceToProperty.typeNode
                    ),
                    hasQuestionToken: referenceToProperty.isOptional,
                    docs: field.docs != null ? [{ description: field.docs }] : undefined,
                };

                return property;
            }),
        ],
        isExported: true,
    });

    maybeAddDocs(node, docs);
}
