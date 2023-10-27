import { RawSchemas } from "@fern-api/yaml-schema";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import {
    ArraySchema,
    EnumSchema,
    MapSchema,
    ObjectProperty,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    ReferencedSchema,
    Schema,
} from "@fern-fern/openapi-ir-model/finalIr";
import {
    convertArrayToTypeReference,
    convertLiteralToTypeReference,
    convertMapToTypeReference,
    convertOptionalToTypeReference,
    convertPrimitiveToTypeReference,
    convertReferenceToTypeReference,
    convertToTypeReference,
    convertUnknownToTypeReference,
} from "./convertToTypeReference";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface TypeDeclarations {
    name?: string | undefined;
    typeDeclaration: RawSchemas.TypeDeclarationSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertToTypeDeclaration(schema: Schema, schemas: Record<SchemaId, Schema>): TypeDeclarations {
    if (schema.type === "object") {
        return convertObjectToTypeDeclaration({ schema, schemas });
    } else if (schema.type === "array") {
        return convertArrayToTypeDeclaration({ schema, schemas });
    } else if (schema.type === "map") {
        return convertMapToTypeDeclaration({ schema, schemas });
    } else if (schema.type === "primitive") {
        return convertPrimitiveToTypeDeclaration(schema);
    } else if (schema.type === "enum") {
        return convertEnumToTypeDeclaration(schema);
    } else if (schema.type === "reference") {
        return convertReferenceToTypeDeclaration({ schema, schemas });
    } else if (schema.type === "optional") {
        return convertOptionalToTypeDeclaration({ schema, schemas });
    } else if (schema.type === "nullable") {
        return convertToTypeDeclaration(schema.value, schemas);
    } else if (schema.type === "literal") {
        return convertLiteralToTypeDeclaration(schema.value);
    } else if (schema.type === "unknown") {
        return convertUnknownToTypeDeclaration();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (schema.type === "oneOf") {
        return convertOneOfToTypeDeclaration({ schema: schema.oneOf, schemas });
    }
    throw new Error(`Failed to convert to type declaration: ${JSON.stringify(schema)}`);
}

export function convertObjectToTypeDeclaration({
    schema,
    schemas,
}: {
    schema: ObjectSchema;
    schemas: Record<SchemaId, Schema>;
}): TypeDeclarations {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    const properties: Record<string, RawSchemas.ObjectPropertySchema> = {};
    const schemasToInline = new Set<SchemaId>();
    for (const property of schema.properties) {
        if (Object.keys(property.conflict).length > 0) {
            const parentHasIdentiticalProperty = Object.entries(property.conflict).every(([_, conflict]) => {
                return !conflict.differentSchema;
            });
            if (parentHasIdentiticalProperty) {
                continue; // just use the parent property instead of redefining
            } else {
                Object.entries(property.conflict).forEach(([schemaId]) => {
                    schemasToInline.add(schemaId);
                });
            }
        }
        const propertyTypeReference = convertToTypeReference({ schema: property.schema, schemas });
        properties[property.key] = propertyTypeReference.typeReference;
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...propertyTypeReference.additionalTypeDeclarations,
        };
    }
    const propertiesToSetToUnknown: Set<string> = new Set<string>();

    for (const allOfPropertyConflict of schema.allOfPropertyConflicts) {
        allOfPropertyConflict.allOfSchemaIds.forEach((schemaId) => schemasToInline.add(schemaId));
        if (allOfPropertyConflict.conflictingTypeSignatures) {
            propertiesToSetToUnknown.add(allOfPropertyConflict.propertyKey);
        }
    }

    const extendedSchemas: string[] = [];
    for (const allOf of schema.allOf) {
        if (schemasToInline.has(allOf.schema)) {
            continue; // dont extend from schemas that need to be inlined
        }
        const allOfTypeReference = convertToTypeReference({ schema: Schema.reference(allOf), schemas });
        extendedSchemas.push(getTypeFromTypeReference(allOfTypeReference.typeReference));
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...allOfTypeReference.additionalTypeDeclarations,
        };
    }

    for (const inlineSchemaId of schemasToInline) {
        const inlinedSchema = schemas[inlineSchemaId];
        if (inlinedSchema == null) {
            throw new Error(`Failed to find schema=${inlineSchemaId}`);
        }
        const inlinedSchemaPropertyInfo = getAllProperties({
            schema: inlinedSchema,
            schemaId: inlineSchemaId,
        });
        for (const propertyToInline of inlinedSchemaPropertyInfo.properties) {
            if (properties[propertyToInline.key] == null) {
                if (propertiesToSetToUnknown.has(propertyToInline.key)) {
                    properties[propertyToInline.key] = "unknown";
                }
                const propertyTypeReference = convertToTypeReference({ schema: propertyToInline.schema, schemas });
                properties[propertyToInline.key] = propertyTypeReference.typeReference;
            }
        }
        for (const extendedSchema of inlinedSchemaPropertyInfo.allOf) {
            const extendedSchemaTypeReference = convertToTypeReference({
                schema: Schema.reference(extendedSchema),
                schemas,
            });
            extendedSchemas.push(getTypeFromTypeReference(extendedSchemaTypeReference.typeReference));
        }
    }

    const objectTypeDeclaration: RawSchemas.ObjectSchema = {
        docs: schema.description ?? undefined,
        properties: Object.fromEntries(
            Object.entries(properties).map(([propertyKey, propertyDefinition]) => {
                if (startsWithNumber(propertyKey)) {
                    return [
                        propertyKey,
                        typeof propertyDefinition === "string"
                            ? {
                                  type: propertyDefinition,
                                  name: `_${propertyKey}`,
                              }
                            : {
                                  ...propertyDefinition,
                                  name: `_${propertyKey}`,
                              },
                    ];
                }
                return [propertyKey, propertyDefinition];
            })
        ),
    };
    if (extendedSchemas.length > 0) {
        objectTypeDeclaration.extends = extendedSchemas;
    }
    return {
        name: schema.nameOverride ?? schema.generatedName,
        typeDeclaration: objectTypeDeclaration,
        additionalTypeDeclarations,
    };
}

function getAllProperties({ schemaId, schema }: { schemaId: SchemaId; schema: Schema }): {
    properties: ObjectProperty[];
    allOf: ReferencedSchema[];
} {
    if (schema.type !== "object") {
        throw new Error(`Cannot getAllProperties for a non-object schema. schemaId=${schemaId}`);
    }
    const properties: ObjectProperty[] = [...schema.properties];
    return { properties, allOf: schema.allOf };
}

export function convertArrayToTypeDeclaration({
    schema,
    schemas,
}: {
    schema: ArraySchema;
    schemas: Record<SchemaId, Schema>;
}): TypeDeclarations {
    const arrayTypeReference = convertArrayToTypeReference({ schema, schemas });
    return {
        typeDeclaration: arrayTypeReference.typeReference,
        additionalTypeDeclarations: {
            ...arrayTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertMapToTypeDeclaration({
    schema,
    schemas,
}: {
    schema: MapSchema;
    schemas: Record<SchemaId, Schema>;
}): TypeDeclarations {
    const mapTypeReference = convertMapToTypeReference({ schema, schemas });
    return {
        typeDeclaration: mapTypeReference.typeReference,
        additionalTypeDeclarations: {
            ...mapTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertPrimitiveToTypeDeclaration(schema: PrimitiveSchema): TypeDeclarations {
    const primitiveTypeReference = convertPrimitiveToTypeReference(schema);
    return {
        typeDeclaration: primitiveTypeReference.typeReference,
        additionalTypeDeclarations: {},
    };
}

export function convertEnumToTypeDeclaration(schema: EnumSchema): TypeDeclarations {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        typeDeclaration: {
            docs: schema.description ?? undefined,
            enum: schema.values.map((enumValue) => {
                return {
                    name: enumValue.nameOverride ?? enumValue.generatedName,
                    value: enumValue.value,
                    docs: enumValue.description ?? undefined,
                };
            }),
        },
        additionalTypeDeclarations: {},
    };
}

export function convertReferenceToTypeDeclaration({
    schema,
    schemas,
}: {
    schema: ReferencedSchema;
    schemas: Record<SchemaId, Schema>;
}): TypeDeclarations {
    const referenceTypeReference = convertReferenceToTypeReference({ schema, schemas });
    return {
        name: schema.nameOverride ?? schema.generatedName,
        typeDeclaration: referenceTypeReference.typeReference,
        additionalTypeDeclarations: {
            ...referenceTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertOptionalToTypeDeclaration({
    schema,
    schemas,
}: {
    schema: OptionalSchema;
    schemas: Record<SchemaId, Schema>;
}): TypeDeclarations {
    const optionalTypeReference = convertOptionalToTypeReference({ schema, schemas });
    return {
        typeDeclaration: optionalTypeReference.typeReference,
        additionalTypeDeclarations: {
            ...optionalTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertUnknownToTypeDeclaration(): TypeDeclarations {
    const unknownTypeReference = convertUnknownToTypeReference();
    return {
        typeDeclaration: unknownTypeReference.typeReference,
        additionalTypeDeclarations: {
            ...unknownTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertLiteralToTypeDeclaration(value: string): TypeDeclarations {
    const literalTypeReference = convertLiteralToTypeReference(value);
    return {
        typeDeclaration: literalTypeReference.typeReference,
        additionalTypeDeclarations: {
            ...literalTypeReference.additionalTypeDeclarations,
        },
    };
}

export function convertOneOfToTypeDeclaration({
    schema,
    schemas,
}: {
    schema: OneOfSchema;
    schemas: Record<SchemaId, Schema>;
}): TypeDeclarations {
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    if (schema.type === "discriminated") {
        const baseProperties: Record<string, RawSchemas.ObjectPropertySchema> = {};
        for (const property of schema.commonProperties) {
            const propertyTypeReference = convertToTypeReference({ schema: property.schema, schemas });
            baseProperties[property.key] = propertyTypeReference.typeReference;
            additionalTypeDeclarations = {
                ...additionalTypeDeclarations,
                ...propertyTypeReference.additionalTypeDeclarations,
            };
        }
        const union: Record<string, RawSchemas.SingleUnionTypeSchema> = {};
        for (const [discriminantValue, subSchema] of Object.entries(schema.schemas)) {
            const subSchemaTypeReference = convertToTypeReference({ schema: subSchema, schemas });
            if (typeof subSchemaTypeReference.typeReference === "string") {
                union[discriminantValue] = subSchemaTypeReference.typeReference;
            } else {
                union[discriminantValue] = {
                    type: subSchemaTypeReference.typeReference.type,
                    docs: subSchemaTypeReference.typeReference.docs,
                };
            }
            additionalTypeDeclarations = {
                ...additionalTypeDeclarations,
                ...subSchemaTypeReference.additionalTypeDeclarations,
            };
        }
        return {
            name: schema.nameOverride ?? schema.generatedName,
            typeDeclaration: {
                discriminant: schema.discriminantProperty,
                "base-properties": baseProperties,
                docs: schema.description ?? undefined,
                union,
            },
            additionalTypeDeclarations,
        };
    }

    const union: RawSchemas.TypeReferenceWithDocsSchema[] = [];
    for (const subSchema of schema.schemas) {
        const subSchemaTypeReference = convertToTypeReference({ schema: subSchema, schemas });
        if (typeof subSchemaTypeReference.typeReference === "string") {
            union.push(subSchemaTypeReference.typeReference);
        } else {
            union.push({
                type: subSchemaTypeReference.typeReference.type,
                docs: subSchemaTypeReference.typeReference.docs,
            });
        }
        additionalTypeDeclarations = {
            ...additionalTypeDeclarations,
            ...subSchemaTypeReference.additionalTypeDeclarations,
        };
    }
    return {
        name: schema.nameOverride ?? schema.generatedName,
        typeDeclaration: {
            discriminated: false,
            docs: schema.description ?? undefined,
            union,
        },
        additionalTypeDeclarations,
    };
}

const STARTS_WITH_NUMBER = /^[0-9]/;
function startsWithNumber(str: string): boolean {
    return STARTS_WITH_NUMBER.test(str);
}
