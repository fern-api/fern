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
    if (schema.type === "object") {
        return buildObjectTypeDeclaration({ schema, context, declarationFile });
    } else if (schema.type === "array") {
        return buildArrayTypeDeclaration({ schema, context, declarationFile });
    } else if (schema.type === "map") {
        return buildMapTypeDeclaration({ schema, context, declarationFile });
    } else if (schema.type === "primitive") {
        return buildPrimitiveTypeDeclaration(schema);
    } else if (schema.type === "enum") {
        return buildEnumTypeDeclaration(schema);
    } else if (schema.type === "reference") {
        return buildReferenceTypeDeclaration({ schema, context, declarationFile });
    } else if (schema.type === "optional") {
        return buildOptionalTypeDeclaration({ schema, context, declarationFile });
    } else if (schema.type === "nullable") {
        return buildOptionalTypeDeclaration({ schema, context, declarationFile });
    } else if (schema.type === "literal") {
        return buildLiteralTypeDeclaration(schema.value);
    } else if (schema.type === "unknown") {
        return buildUnknownTypeDeclaration();
    } else if (schema.type === "oneOf") {
        return buildOneOfTypeDeclaration({ schema: schema.oneOf, context, declarationFile });
    }
    throw new Error(`Failed to convert to type declaration: ${JSON.stringify(schema)}`);
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
        properties[property.key] = buildTypeReference({
            schema: property.schema,
            context,
            fileContainingReference: declarationFile
        });
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
        const inlinedSchema = context.getSchema(inlineSchemaId);
        const inlinedSchemaPropertyInfo = getAllProperties({
            schema: inlinedSchema,
            schemaId: inlineSchemaId
        });
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
        name: undefined,
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
        name: undefined,
        schema: buildMapTypeReference({ schema, fileContainingReference: declarationFile, context })
    };
}

export function buildPrimitiveTypeDeclaration(schema: PrimitiveSchema): ConvertedTypeDeclaration {
    return {
        name: undefined,
        schema: buildPrimitiveTypeReference(schema)
    };
}

export function buildEnumTypeDeclaration(schema: EnumSchema): ConvertedTypeDeclaration {
    return {
        name: schema.nameOverride ?? schema.generatedName,
        schema: {
            docs: schema.description ?? undefined,
            enum: schema.values.map((enumValue) => {
                return {
                    name: enumValue.nameOverride ?? enumValue.generatedName,
                    value: enumValue.value,
                    docs: enumValue.description ?? undefined
                };
            })
        }
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
        name: undefined,
        schema: buildOptionalTypeReference({ schema, context, fileContainingReference: declarationFile })
    };
}

export function buildUnknownTypeDeclaration(): ConvertedTypeDeclaration {
    return {
        name: undefined,
        schema: buildUnknownTypeReference()
    };
}

export function buildLiteralTypeDeclaration(value: LiteralSchemaValue): ConvertedTypeDeclaration {
    return {
        name: undefined,
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
