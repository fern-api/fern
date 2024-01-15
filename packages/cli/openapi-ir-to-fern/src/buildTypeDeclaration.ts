import { assertNever } from "@fern-api/core-utils";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { SchemaId } from "@fern-fern/openapi-ir-model/commons";
import {
    ArraySchema,
    EnumSchema,
    LiteralSchemaValue,
    MapSchema,
    ObjectProperty,
    ObjectSchema,
    OneOfSchema,
    OptionalSchema,
    PrimitiveSchema,
    ReferencedSchema,
    Schema
} from "@fern-fern/openapi-ir-model/finalIr";
import {
    buildArrayTypeReference,
    buildLiteralTypeReference,
    buildMapTypeReference,
    buildOptionalTypeReference,
    buildPrimitiveTypeReference,
    buildReferenceTypeReference,
    buildTypeReference,
    buildUnknownTypeReference
} from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface ConvertedTypeDeclaration {
    name: string | undefined;
    schema: RawSchemas.TypeDeclarationSchema;
}

export function buildTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: Schema;
    context: OpenApiIrConverterContext;
    /* The file the type declaration will be added to */
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
    switch (schema.type) {
        case "primitive":
            return buildPrimitiveTypeDeclaration(schema);
        case "array":
            return buildArrayTypeDeclaration({ schema, context, declarationFile });
        case "map":
            return buildMapTypeDeclaration({ schema, context, declarationFile });
        case "reference":
            return buildReferenceTypeDeclaration({ schema, context, declarationFile });
        case "unknown":
            return buildUnknownTypeDeclaration(schema.nameOverride, schema.generatedName);
        case "optional":
        case "nullable":
            return buildOptionalTypeDeclaration({ schema, context, declarationFile });
        case "enum":
            return buildEnumTypeDeclaration(schema);
        case "literal":
            return buildLiteralTypeDeclaration(schema.value, schema.nameOverride, schema.generatedName);
        case "object":
            return buildObjectTypeDeclaration({ schema, context, declarationFile });
        case "oneOf":
            return buildOneOfTypeDeclaration({ schema: schema.oneOf, context, declarationFile });
        default:
            assertNever(schema);
    }
}

export function buildObjectTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: ObjectSchema;
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
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
        const typeReference = buildTypeReference({
            schema: property.schema,
            context,
            fileContainingReference: declarationFile
        });
        if (property.audiences.length > 0) {
            properties[property.key] =
                typeof typeReference === "string"
                    ? { type: typeReference, audiences: property.audiences }
                    : { ...typeReference, audiences: property.audiences };
        } else {
            properties[property.key] = typeReference;
        }
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
        const allOfTypeReference = buildTypeReference({
            schema: Schema.reference(allOf),
            context,
            fileContainingReference: declarationFile
        });
        extendedSchemas.push(getTypeFromTypeReference(allOfTypeReference));
    }

    for (const inlineSchemaId of schemasToInline) {
        const inlinedSchemaPropertyInfo = getAllProperties(context, inlineSchemaId);
        for (const propertyToInline of inlinedSchemaPropertyInfo.properties) {
            if (properties[propertyToInline.key] == null) {
                if (propertiesToSetToUnknown.has(propertyToInline.key)) {
                    properties[propertyToInline.key] = "unknown";
                }
                properties[propertyToInline.key] = buildTypeReference({
                    schema: propertyToInline.schema,
                    context,
                    fileContainingReference: declarationFile
                });
            }
        }
        for (const extendedSchema of inlinedSchemaPropertyInfo.allOf) {
            const extendedSchemaTypeReference = buildTypeReference({
                schema: Schema.reference(extendedSchema),
                context,
                fileContainingReference: declarationFile
            });
            extendedSchemas.push(getTypeFromTypeReference(extendedSchemaTypeReference));
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
                                  name: `_${propertyKey}`
                              }
                            : {
                                  ...propertyDefinition,
                                  name: `_${propertyKey}`
                              }
                    ];
                }
                return [propertyKey, propertyDefinition];
            })
        )
    };
    if (extendedSchemas.length > 0) {
        objectTypeDeclaration.extends = extendedSchemas;
    }
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: objectTypeDeclaration
    };
}

function getAllProperties(
    context: OpenApiIrConverterContext,
    schemaId: SchemaId
): {
    properties: ObjectProperty[];
    allOf: ReferencedSchema[];
} {
    const schema = context.getSchema(schemaId);
    if (schema.type === "object") {
        return { properties: schema.properties, allOf: schema.allOf };
    } else if (schema.type === "reference") {
        return getAllProperties(context, schema.schema);
    }
    throw new Error(`Cannot getAllProperties for a non-object schema. schemaId=${schemaId}, type=${schema.type}`);
}

export function buildArrayTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: ArraySchema;
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: buildArrayTypeReference({ schema, fileContainingReference: declarationFile, context })
    };
}

export function buildMapTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: MapSchema;
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: buildMapTypeReference({ schema, fileContainingReference: declarationFile, context })
    };
}

export function buildPrimitiveTypeDeclaration(schema: PrimitiveSchema): ConvertedTypeDeclaration {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: buildPrimitiveTypeReference(schema)
    };
}

export function buildEnumTypeDeclaration(schema: EnumSchema): ConvertedTypeDeclaration {
    const enumSchema: RawSchemas.EnumSchema = {
        enum: schema.values.map((enumValue) => {
            const name = enumValue.nameOverride ?? enumValue.generatedName;
            const value = enumValue.value;
            if (name === value && enumValue.description == null) {
                return name;
            } else if (name === value && enumValue.description != null) {
                return {
                    value,
                    docs: enumValue.description
                };
            }
            const enumValueDeclaration: RawSchemas.EnumValueSchema = {
                name: enumValue.nameOverride ?? enumValue.generatedName,
                value: enumValue.value
            };
            if (enumValue.description != null) {
                enumValueDeclaration.docs = enumValue.description;
            }
            return enumValueDeclaration;
        })
    };
    if (schema.description != null) {
        enumSchema.docs = schema.description;
    }
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: enumSchema
    };
}

export function buildReferenceTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: ReferencedSchema;
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: buildReferenceTypeReference({ schema, context, fileContainingReference: declarationFile })
    };
}

export function buildOptionalTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: OptionalSchema;
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: buildOptionalTypeReference({ schema, context, fileContainingReference: declarationFile })
    };
}

export function buildUnknownTypeDeclaration(
    nameOverride: string | null | undefined,
    generatedName: string
): ConvertedTypeDeclaration {
    return {
        name: nameOverride ?? generatedName,
        schema: buildUnknownTypeReference()
    };
}

export function buildLiteralTypeDeclaration(
    value: LiteralSchemaValue,
    nameOverride: string | null | undefined,
    generatedName: string
): ConvertedTypeDeclaration {
    return {
        name: nameOverride ?? generatedName,
        schema: buildLiteralTypeReference(value)
    };
}

export function buildOneOfTypeDeclaration({
    schema,
    context,
    declarationFile
}: {
    schema: OneOfSchema;
    context: OpenApiIrConverterContext;
    declarationFile: RelativeFilePath;
}): ConvertedTypeDeclaration {
    if (schema.type === "discriminated") {
        const baseProperties: Record<string, RawSchemas.ObjectPropertySchema> = {};
        for (const property of schema.commonProperties) {
            baseProperties[property.key] = buildTypeReference({
                schema: property.schema,
                fileContainingReference: declarationFile,
                context
            });
        }
        const union: Record<string, RawSchemas.SingleUnionTypeSchema> = {};
        for (const [discriminantValue, subSchema] of Object.entries(schema.schemas)) {
            union[discriminantValue] = buildTypeReference({
                schema: subSchema,
                context,
                fileContainingReference: declarationFile
            });
        }
        return {
            name: schema.nameOverride ?? schema.generatedName,
            schema: {
                discriminant: schema.discriminantProperty,
                "base-properties": baseProperties,
                docs: schema.description ?? undefined,
                union
            }
        };
    }

    const union: RawSchemas.TypeReferenceWithDocsSchema[] = [];
    for (const subSchema of schema.schemas) {
        union.push(
            buildTypeReference({
                schema: subSchema,
                fileContainingReference: declarationFile,
                context
            })
        );
    }
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: {
            discriminated: false,
            docs: schema.description ?? undefined,
            union
        }
    };
}

const STARTS_WITH_NUMBER = /^[0-9]/;
function startsWithNumber(str: string): boolean {
    return STARTS_WITH_NUMBER.test(str);
}
