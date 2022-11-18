import { ObjectTypeDeclaration, TypeDeclaration, TypeReference } from "@fern-fern/ir-model/types";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { Zurg } from "@fern-typescript/commons-v2";
import { SdkFile } from "@fern-typescript/sdk-declaration-handler";
import { ModuleDeclaration, ts } from "ts-morph";
import { AbstractSchemaGenerator } from "../AbstractSchemaGenerator";
import { AbstractTypeSchemaGenerator } from "../AbstractTypeSchemaGenerator";
import { generateObjectType, PropertyWithSchema } from "./generateObjectType";

export declare namespace ObjectTypeGenerator {
    export interface Init {
        typeDeclaration: TypeDeclaration;
        typeName: string;
        shape: ObjectTypeDeclaration;
        additionalProperties?: ObjectTypeGenerator.AdditionalProperty[];
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

export class ObjectTypeGenerator extends AbstractTypeSchemaGenerator {
    private typeDeclaration: TypeDeclaration;
    private shape: ObjectTypeDeclaration;
    private properties: PropertyWithSchema[];

    constructor({ typeDeclaration, typeName, shape, additionalProperties = [] }: ObjectTypeGenerator.Init) {
        super({ typeName });

        this.typeDeclaration = typeDeclaration;
        this.shape = shape;

        this.properties = [
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
    }

    public generate({ typeFile, schemaFile }: { typeFile: SdkFile; schemaFile: SdkFile }): void {
        generateObjectType({
            typeName: this.typeName,
            typeDeclaration: this.typeDeclaration,
            typeFile,
            shape: this.shape,
            properties: this.properties,
        });
        this.writeSchemaToFile(schemaFile);
    }

    protected override getReferenceToSchemaType(file: SdkFile): ts.TypeNode {
        return file.coreUtilities.zurg.ObjectSchema._getReferenceToType({
            rawShape: this.getReferenceToRawShape(),
            parsedShape: this.getReferenceToParsedShape(file),
        });
    }

    protected override getReferenceToParsedShape(file: SdkFile): ts.TypeNode {
        return file.getReferenceToNamedType(this.typeDeclaration.name).getTypeNode();
    }

    protected override generateRawTypeDeclaration(file: SdkFile, module: ModuleDeclaration): void {
        module.addInterface({
            name: AbstractSchemaGenerator.RAW_TYPE_NAME,
            extends: this.shape.extends.map((extension) =>
                getTextOfTsNode(file.getReferenceToRawNamedType(extension).getTypeNode())
            ),
            properties: this.properties.map((property) => {
                const propertyTypeWithMetadata = property.getRawValueType(file);

                return {
                    name: `"${property.key.raw}"`,
                    type: getTextOfTsNode(propertyTypeWithMetadata.type),
                    hasQuestionToken: propertyTypeWithMetadata.isOptional,
                };
            }),
        });
    }

    protected override getSchema(file: SdkFile): Zurg.Schema {
        let schema = file.coreUtilities.zurg.object(
            this.properties.map((property) => ({
                key: {
                    raw: property.key.raw,
                    parsed: property.key.parsed,
                },
                value: property.getSchema(file),
            }))
        );

        for (const extension of this.shape.extends) {
            schema = schema.extend(file.getSchemaOfNamedType(extension));
        }

        return schema;
    }
}

function getValueGettersFromAdditionalProperty(
    additionalProperty: ObjectTypeGenerator.AdditionalProperty
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
