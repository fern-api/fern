import { ObjectProperty, PrimitiveTypeV1, PrimitiveTypeV2, Type, TypeReference } from "@fern-api/ir-sdk";
import { RawSchemas } from "@fern-api/yaml-schema";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertDeclaration } from "../convertDeclaration";

export async function convertObjectTypeDeclaration({
    object,
    file
}: {
    object: RawSchemas.ObjectSchema;
    file: FernFileContext;
}): Promise<Type> {
    return Type.object({
        extends: getExtensionsAsList(object.extends).map((extended) => parseTypeName({ typeName: extended, file })),
        properties: await getObjectPropertiesFromRawObjectSchema(object, file),
        extraProperties: object["extra-properties"] ?? false
    });
}

export async function getObjectPropertiesFromRawObjectSchema(
    object: RawSchemas.ObjectSchema,
    file: FernFileContext
): Promise<ObjectProperty[]> {
    if (object.properties == null) {
        return [];
    }
    return await Promise.all(
        Object.entries(object.properties).map(async ([propertyKey, propertyDefinition]) => ({
            ...(await convertDeclaration(propertyDefinition)),
            name: file.casingsGenerator.generateNameAndWireValue({
                wireValue: propertyKey,
                name: getPropertyName({ propertyKey, property: propertyDefinition }).name
            }),
            valueType: parsePropertyTypeReference({
                file,
                property: propertyDefinition
            })
        }))
    );
}

export function getExtensionsAsList(extensions: string | string[] | undefined): string[] {
    if (extensions == null) {
        return [];
    }
    if (typeof extensions === "string") {
        return [extensions];
    }
    return extensions;
}

export function getPropertyName({
    propertyKey,
    property
}: {
    propertyKey: string;
    property: RawSchemas.ObjectPropertySchema;
}): { name: string; wasExplicitlySet: boolean } {
    if (typeof property !== "string" && property.name != null) {
        return {
            name: property.name,
            wasExplicitlySet: true
        };
    }

    return {
        name: propertyKey,
        wasExplicitlySet: false
    };
}

function parsePropertyTypeReference({
    property,
    file
}: {
    property: RawSchemas.ObjectPropertySchema;
    file: FernFileContext;
}): TypeReference {
    const typeReference = file.parseTypeReference(property);
    if (isRawStringObjectProperty(property)) {
        return TypeReference.primitive({
            v1: PrimitiveTypeV1.String,
            v2: PrimitiveTypeV2.string({
                default: property.default != null ? property.default : undefined,
                validation: {
                    minLength: property.minLength,
                    maxLength: property.maxLength,
                    pattern: property.pattern,
                    format: property.format
                }
            })
        });
    }
    if (isRawIntegerObjectProperty(property)) {
        return TypeReference.primitive({
            v1: PrimitiveTypeV1.Integer,
            v2: PrimitiveTypeV2.integer({
                default: property.default != null ? property.default : undefined,
                validation: {
                    min: property.min,
                    max: property.max,
                    exclusiveMin: property.exclusiveMin,
                    exclusiveMax: property.exclusiveMax,
                    multipleOf: property.multipleOf
                }
            })
        });
    }
    if (isRawDoubleObjectProperty(property)) {
        return TypeReference.primitive({
            v1: PrimitiveTypeV1.Double,
            v2: PrimitiveTypeV2.double({
                default: property.default != null ? property.default : undefined,
                validation: {
                    min: property.min,
                    max: property.max,
                    exclusiveMin: property.exclusiveMin,
                    exclusiveMax: property.exclusiveMax,
                    multipleOf: property.multipleOf
                }
            })
        });
    }
    return typeReference;
}

function isRawStringObjectProperty(
    rawObjectProperty: RawSchemas.ObjectPropertySchema
): rawObjectProperty is RawSchemas.StringPropertySchema {
    const stringPropertySchema = rawObjectProperty as RawSchemas.StringPropertySchema;
    return (
        stringPropertySchema.type === "string" &&
        (stringPropertySchema.default != null ||
            stringPropertySchema.minLength != null ||
            stringPropertySchema.maxLength != null)
    );
}

function isRawIntegerObjectProperty(
    rawObjectProperty: RawSchemas.ObjectPropertySchema
): rawObjectProperty is RawSchemas.IntegerPropertySchema {
    const integerPropertySchema = rawObjectProperty as RawSchemas.IntegerPropertySchema;
    return (
        integerPropertySchema.type === "integer" &&
        (integerPropertySchema.default != null ||
            integerPropertySchema.min != null ||
            integerPropertySchema.max != null ||
            integerPropertySchema.exclusiveMax != null ||
            integerPropertySchema.exclusiveMin != null ||
            integerPropertySchema.multipleOf != null)
    );
}

function isRawDoubleObjectProperty(
    rawObjectProperty: RawSchemas.ObjectPropertySchema
): rawObjectProperty is RawSchemas.DoublePropertySchema {
    const doublePropertySchema = rawObjectProperty as RawSchemas.DoublePropertySchema;
    return (
        doublePropertySchema.type === "double" &&
        (doublePropertySchema.default != null ||
            doublePropertySchema.min != null ||
            doublePropertySchema.max != null ||
            doublePropertySchema.exclusiveMax != null ||
            doublePropertySchema.exclusiveMin != null ||
            doublePropertySchema.multipleOf != null)
    );
}
