import { ObjectTypeDeclaration, TypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode, maybeAddDocs } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { OptionalKind, PropertySignatureStructure, ts } from "ts-morph";
import { generateSchemaDeclarations } from "./generateSchemaDeclarations";

interface PropertyWithSchema {
    docs: string | undefined;
    key: {
        raw: string;
        parsed: string;
    };
    getValueType: (file: SdkFile) => {
        type: ts.TypeNode;
        isOptional: boolean;
    };
    getRawValueType: (file: SdkFile) => {
        type: ts.TypeNode;
        isOptional: boolean;
    };
    getSchema: (file: SdkFile) => Zurg.Schema;
}

export declare namespace generateObjectType {
    interface Args {
        typeFile: SdkFile;
        schemaFile: SdkFile;
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: ObjectTypeDeclaration;
        additionalProperties?: generateObjectType.AdditionalProperty[];
    }

    interface AdditionalProperty {
        docs: string | undefined;
        key: {
            raw: string;
            parsed: string;
        };
        value: { type: "type"; reference: TypeReference } | { type: "literal"; literal: string; isOptional: boolean };
    }
}

export function generateObjectType({
    typeName,
    typeDeclaration,
    typeFile,
    schemaFile,
    shape,
    additionalProperties = [],
}: generateObjectType.Args): void {
    const properties: PropertyWithSchema[] = [
        ...additionalProperties.map((additionalProperty) => ({
            docs: additionalProperty.docs,
            key: {
                raw: additionalProperty.key.raw,
                parsed: additionalProperty.key.parsed,
            },
            ...getValueGettersFromAdditionalProperty(additionalProperty),
        })),
        ...shape.properties.map((property): PropertyWithSchema => {
            return {
                docs: property.docs ?? undefined,
                key: {
                    raw: property.name.wireValue,
                    parsed: property.name.camelCase,
                },
                ...getValueGettersForTypeReference(property.valueType),
            };
        }),
    ];

    const interfaceNode = typeFile.sourceFile.addInterface({
        name: typeName,
        properties: [
            ...properties.map((property) => {
                const value = property.getValueType(typeFile);
                const propertyNode: OptionalKind<PropertySignatureStructure> = {
                    name: property.key.parsed,
                    type: getTextOfTsNode(value.type),
                    hasQuestionToken: value.isOptional,
                    docs: property.docs != null ? [{ description: property.docs }] : undefined,
                };

                return propertyNode;
            }),
        ],
        isExported: true,
    });

    maybeAddDocs(interfaceNode, typeDeclaration.docs);

    let schema = schemaFile.coreUtilities.zurg.object(
        properties.map((property) => ({
            key: {
                raw: property.key.raw,
                parsed: property.key.parsed,
            },
            value: property.getSchema(schemaFile),
        }))
    );

    for (const extension of shape.extends) {
        interfaceNode.addExtends(getTextOfTsNode(typeFile.getReferenceToNamedType(extension).typeNode));
        schema = schema.extend(schemaFile.getSchemaOfNamedType(extension));
    }

    generateSchemaDeclarations({
        schemaFile,
        schema,
        typeDeclaration,
        typeName,
        isObject: true,
        generateRawTypeDeclaration: (module, rawTypeName) => {
            module.addInterface({
                name: rawTypeName,
                extends: shape.extends.map((extension) =>
                    getTextOfTsNode(schemaFile.getReferenceToRawNamedType(extension).typeNode)
                ),
                properties: properties.map((property) => {
                    const propertyTypeWithMetadata = property.getRawValueType(schemaFile);
                    let type = propertyTypeWithMetadata.type;
                    if (propertyTypeWithMetadata.isOptional) {
                        type = ts.factory.createUnionTypeNode([
                            type,
                            ts.factory.createLiteralTypeNode(ts.factory.createNull()),
                        ]);
                    }

                    return {
                        name: `"${property.key.raw}"`,
                        type: getTextOfTsNode(type),
                        hasQuestionToken: propertyTypeWithMetadata.isOptional,
                    };
                }),
            });
        },
    });
}

function getValueGettersFromAdditionalProperty(
    additionalProperty: generateObjectType.AdditionalProperty
): Pick<PropertyWithSchema, "getValueType" | "getRawValueType" | "getSchema"> {
    switch (additionalProperty.value.type) {
        case "literal": {
            const { isOptional, literal } = additionalProperty.value;
            return {
                getValueType: () => {
                    return {
                        isOptional,
                        type: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(literal)),
                    };
                },
                getRawValueType: () => {
                    return {
                        isOptional,
                        type: ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(literal)),
                    };
                },
                getSchema: (file) => {
                    let schema = file.coreUtilities.zurg.stringLiteral(literal);
                    if (isOptional) {
                        schema = schema.optional();
                    }
                    return schema;
                },
            };
        }
        case "type":
            return getValueGettersForTypeReference(additionalProperty.value.reference);
    }
}

function getValueGettersForTypeReference(
    reference: TypeReference
): Pick<PropertyWithSchema, "getValueType" | "getRawValueType" | "getSchema"> {
    return {
        getValueType: (file) => {
            const referenceToProperty = file.getReferenceToType(reference);
            return {
                isOptional: referenceToProperty.isOptional,
                type: referenceToProperty.isOptional
                    ? referenceToProperty.typeNodeWithoutUndefined
                    : referenceToProperty.typeNode,
            };
        },
        getRawValueType: (file) => {
            const referenceToProperty = file.getReferenceToRawType(reference);
            return {
                isOptional: referenceToProperty.isOptional,
                type: referenceToProperty.isOptional
                    ? referenceToProperty.typeNodeWithoutUndefined
                    : referenceToProperty.typeNode,
            };
        },
        getSchema: (file) => file.getSchemaOfTypeReference(reference),
    };
}
