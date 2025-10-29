import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { RawSchemas } from "@fern-api/fern-definition-schema";
import { generateEnumNameFromValue, QueryParameter, Schema, VALID_ENUM_NAME_REGEX } from "@fern-api/openapi-ir";
import { RelativeFilePath } from "@fern-api/path-utils";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { convertAvailability } from "./utils/convertAvailability";
import { getDefaultFromTypeReference, getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildQueryParameter({
    queryParameter,
    context,
    fileContainingReference,
    namespace
}: {
    queryParameter: QueryParameter;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
    namespace: string | undefined;
}): RawSchemas.HttpQueryParameterSchema | undefined {
    const typeReference = getQueryParameterTypeReference({
        schema: queryParameter.schema,
        context,
        fileContainingReference,
        namespace
    });
    if (typeReference == null) {
        return undefined;
    }

    let queryParameterType = getTypeFromTypeReference(typeReference.value);
    const queryParameterDefault = getDefaultFromTypeReference(typeReference.value);

    // we can assume unknown-typed query parameters are strings by default
    if (queryParameterType === "unknown") {
        queryParameterType = "string";
    } else if (queryParameterType === "optional<unknown>") {
        queryParameterType = "optional<string>";
    }

    const queryParameterSchema: RawSchemas.HttpQueryParameterSchema = {
        type: queryParameterType
    };

    if (queryParameterDefault != null) {
        queryParameterSchema.default = queryParameterDefault;
    }

    if (typeReference.allowMultiple) {
        queryParameterSchema["allow-multiple"] = true;
    }

    if (queryParameter.description != null) {
        queryParameterSchema.docs = queryParameter.description;
    }

    if (queryParameter.parameterNameOverride != null) {
        queryParameterSchema.name = queryParameter.parameterNameOverride;
    }

    if (queryParameter.availability != null) {
        queryParameterSchema.availability = convertAvailability(queryParameter.availability);
    }

    if (isRawTypeReferenceDetailedSchema(typeReference.value)) {
        if (typeReference.value.validation !== undefined) {
            queryParameterSchema.validation = typeReference.value.validation;
        }
    }

    if (
        queryParameterSchema.default == null &&
        queryParameterSchema["allow-multiple"] == null &&
        queryParameterSchema.docs == null &&
        queryParameterSchema.name == null &&
        queryParameterSchema.availability == null &&
        queryParameterSchema.validation == null
    ) {
        return queryParameterType;
    }

    return queryParameterSchema;
}

interface QueryParameterTypeReference {
    value: RawSchemas.TypeReferenceSchema;
    allowMultiple: boolean;
}

// TODO(dsinghvi): list query parameters are automatically converted to exploded=true,
// this may be the incorrect wire format
function getQueryParameterTypeReference({
    schema,
    context,
    fileContainingReference,
    namespace
}: {
    schema: Schema;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
    namespace: string | undefined;
}): QueryParameterTypeReference | undefined {
    if (schema.type === "reference") {
        const resolvedSchema = context.getSchema(schema.schema, namespace);
        if (resolvedSchema == null) {
            return undefined;
        } else if (resolvedSchema.type === "array") {
            return {
                value: buildTypeReference({
                    schema: Schema.optional({
                        nameOverride: schema.nameOverride,
                        generatedName: schema.generatedName,
                        title: schema.title,
                        value: resolvedSchema.value,
                        description: schema.description ?? resolvedSchema.description,
                        availability: schema.availability,
                        namespace: undefined,
                        groupName: undefined,
                        inline: undefined
                    }),
                    context,
                    declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
                    fileContainingReference,
                    namespace,
                    declarationDepth: 0
                }),
                allowMultiple: true
            };
        } else if (resolvedSchema.type === "oneOf" && resolvedSchema.value.type === "undiscriminated") {
            // Try to generated enum from literal values
            const potentialEnumValues: (string | RawSchemas.EnumValueSchema)[] = [];
            let foundPrimitiveString = false;
            for (const [_, schema] of Object.entries(resolvedSchema.value.schemas)) {
                if (schema.type === "primitive" && schema.schema.type === "string") {
                    foundPrimitiveString = true;
                }
                if (schema.type === "literal" && schema.value.type === "string") {
                    if (VALID_ENUM_NAME_REGEX.test(schema.value.value)) {
                        potentialEnumValues.push(schema.value.value);
                    } else {
                        potentialEnumValues.push({
                            value: schema.value.value,
                            name: generateEnumNameFromValue(schema.value.value)
                        });
                    }
                }
            }

            if (potentialEnumValues.length > 0) {
                context.builder.addType(fileContainingReference, {
                    name: schema.generatedName,
                    schema: { enum: potentialEnumValues }
                });
                if (foundPrimitiveString && context.respectForwardCompatibleEnums) {
                    context.builder.addType(fileContainingReference, {
                        name: `${schema.generatedName}OrString`,
                        schema: {
                            discriminated: false,
                            union: [
                                {
                                    type: "string"
                                },
                                {
                                    type: schema.generatedName
                                }
                            ]
                        }
                    });
                    return {
                        value: `${schema.generatedName}OrString`,
                        allowMultiple: false
                    };
                } else {
                    return {
                        value: schema.generatedName,
                        allowMultiple: false
                    };
                }
            }

            if (resolvedSchema.value.schemas.length === 2) {
                const [firstSchema, secondSchema] = resolvedSchema.value.schemas;
                if (
                    firstSchema != null &&
                    secondSchema != null &&
                    hasSamePrimitiveValueType({ array: firstSchema, primitive: secondSchema })
                ) {
                    return {
                        value: buildTypeReference({
                            schema: Schema.optional({
                                nameOverride: schema.nameOverride,
                                generatedName: schema.generatedName,
                                title: schema.title,
                                value: secondSchema,
                                description: schema.description,
                                availability: schema.availability,
                                namespace: undefined,
                                groupName: undefined,
                                inline: undefined
                            }),
                            context,
                            fileContainingReference,
                            namespace,
                            declarationDepth: 0
                        }),
                        allowMultiple: true
                    };
                }
                if (
                    firstSchema != null &&
                    secondSchema != null &&
                    hasSamePrimitiveValueType({ array: firstSchema, primitive: secondSchema })
                ) {
                    return {
                        value: buildTypeReference({
                            schema: Schema.optional({
                                nameOverride: schema.nameOverride,
                                generatedName: schema.generatedName,
                                title: schema.title,
                                value: firstSchema,
                                description: schema.description,
                                availability: schema.availability,
                                namespace: undefined,
                                groupName: undefined,
                                inline: undefined
                            }),
                            context,
                            fileContainingReference,
                            namespace,
                            declarationDepth: 0
                        }),
                        allowMultiple: true
                    };
                }
            }

            // If no literal values, just pick the first schema of the undiscriminated union
            for (const [_, schema] of Object.entries(resolvedSchema.value.schemas)) {
                return getQueryParameterTypeReference({
                    schema,
                    context,
                    fileContainingReference,
                    namespace
                });
            }
        } else if (context.objectQueryParameters) {
            const shouldDeclareInline = schema.type !== "reference";
            return {
                value: buildTypeReference({
                    schema,
                    context,
                    fileContainingReference,
                    ...(shouldDeclareInline
                        ? { declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME) }
                        : {}),
                    namespace,
                    declarationDepth: 0
                }),
                allowMultiple: false
            };
        }
    }

    if (schema.type === "optional" || schema.type === "nullable") {
        const optOrNullableSchema = schema.type === "optional" ? Schema.optional : Schema.nullable;
        if (schema.value.type === "reference") {
            const resolvedSchema = context.getSchema(schema.value.schema, namespace);
            if (resolvedSchema == null) {
                return undefined;
            } else if (resolvedSchema.type === "array") {
                return {
                    value: buildTypeReference({
                        schema: optOrNullableSchema({
                            nameOverride: schema.nameOverride,
                            generatedName: schema.generatedName,
                            title: schema.title,
                            value: resolvedSchema.value,
                            description: schema.description ?? resolvedSchema.description,
                            availability: schema.availability,
                            namespace: undefined,
                            groupName: undefined,
                            inline: schema.inline
                        }),
                        context,
                        fileContainingReference,
                        namespace,
                        declarationDepth: 0
                    }),
                    allowMultiple: true
                };
            } else if (context.objectQueryParameters) {
                return {
                    value: buildTypeReference({
                        schema,
                        context,
                        fileContainingReference,
                        namespace,
                        declarationDepth: 0
                    }),
                    allowMultiple: false
                };
            }
        }
        if (schema.value.type === "array") {
            return {
                value: buildTypeReference({
                    schema: optOrNullableSchema({
                        nameOverride: schema.nameOverride,
                        generatedName: schema.generatedName,
                        title: schema.title,
                        value: schema.value.value,
                        description: schema.description,
                        availability: schema.availability,
                        namespace: undefined,
                        groupName: undefined,
                        inline: schema.inline
                    }),
                    context,
                    fileContainingReference,
                    namespace,
                    declarationDepth: 0
                }),
                allowMultiple: true
            };
        } else if (schema.value.type === "oneOf" && schema.value.value.type === "undiscriminated") {
            // Try to generated enum from literal values
            const potentialEnumValues: (string | RawSchemas.EnumValueSchema)[] = [];
            let foundPrimitiveString = false;
            for (const [_, oneOfSchema] of Object.entries(schema.value.value.schemas)) {
                if (oneOfSchema.type === "primitive" && oneOfSchema.schema.type === "string") {
                    foundPrimitiveString = true;
                }
                if (oneOfSchema.type === "literal" && oneOfSchema.value.type === "string") {
                    if (VALID_ENUM_NAME_REGEX.test(oneOfSchema.value.value)) {
                        potentialEnumValues.push(oneOfSchema.value.value);
                    } else {
                        potentialEnumValues.push({
                            value: oneOfSchema.value.value,
                            name: generateEnumNameFromValue(oneOfSchema.value.value)
                        });
                    }
                }
            }

            if (potentialEnumValues.length > 0) {
                context.builder.addType(fileContainingReference, {
                    name: schema.generatedName,
                    schema: { enum: potentialEnumValues }
                });
                if (foundPrimitiveString && context.respectForwardCompatibleEnums) {
                    context.builder.addType(fileContainingReference, {
                        name: `${schema.generatedName}OrString`,
                        schema: {
                            discriminated: false,
                            union: [
                                {
                                    type: "string"
                                },
                                {
                                    type: `optional<${schema.value.value.generatedName}>`
                                }
                            ]
                        }
                    });
                    return {
                        value: `optional<${schema.value.value.generatedName}OrString>`,
                        allowMultiple: false
                    };
                } else {
                    return {
                        value: `optional<${schema.value.value.generatedName}>`,
                        allowMultiple: false
                    };
                }
            }

            if (schema.value.value.schemas.length === 2) {
                const [firstSchema, secondSchema] = schema.value.value.schemas;
                if (
                    firstSchema != null &&
                    secondSchema != null &&
                    hasSamePrimitiveValueType({ array: firstSchema, primitive: secondSchema })
                ) {
                    return {
                        value: buildTypeReference({
                            schema: optOrNullableSchema({
                                nameOverride: schema.nameOverride,
                                generatedName: schema.generatedName,
                                title: schema.title,
                                value: secondSchema,
                                description: schema.description,
                                availability: schema.availability,
                                namespace: undefined,
                                groupName: undefined,
                                inline: schema.inline
                            }),
                            context,
                            fileContainingReference,
                            namespace,
                            declarationDepth: 0
                        }),
                        allowMultiple: true
                    };
                }
                if (
                    firstSchema != null &&
                    secondSchema != null &&
                    hasSamePrimitiveValueType({ array: secondSchema, primitive: firstSchema })
                ) {
                    return {
                        value: buildTypeReference({
                            schema: optOrNullableSchema({
                                nameOverride: schema.nameOverride,
                                generatedName: schema.generatedName,
                                title: schema.title,
                                value: firstSchema,
                                description: schema.description,
                                availability: schema.availability,
                                namespace: undefined,
                                groupName: undefined,
                                inline: schema.inline
                            }),
                            context,
                            fileContainingReference,
                            namespace,
                            declarationDepth: 0
                        }),
                        allowMultiple: true
                    };
                }
            }

            // TODO: (jsklan) currently this is hidden behind the objectQueryParameters flag,
            // But eventually we should probably enable this by default
            if (context.objectQueryParameters) {
                const shouldDeclareInline = !isOrContainsReferenceSchema(schema);
                return {
                    value: buildTypeReference({
                        schema,
                        context,
                        fileContainingReference,
                        ...(shouldDeclareInline
                            ? { declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME) }
                            : {}),
                        namespace,
                        declarationDepth: 0
                    }),
                    allowMultiple: false
                };
            }

            // If no literal values, just pick the first schema of the undiscriminated union
            for (const [_, oneOfSchema] of Object.entries(schema.value.value.schemas)) {
                return getQueryParameterTypeReference({
                    schema: optOrNullableSchema({
                        nameOverride: schema.nameOverride,
                        generatedName: schema.generatedName,
                        title: schema.title,
                        value: oneOfSchema,
                        description: undefined,
                        availability: schema.availability,
                        namespace: undefined,
                        groupName: undefined,
                        inline: schema.inline
                    }),
                    context,
                    fileContainingReference,
                    namespace
                });
            }
        } else if (schema.value.type === "object") {
            if (context.objectQueryParameters) {
                const shouldDeclareInline = !isOrContainsReferenceSchema(schema);
                return {
                    value: buildTypeReference({
                        schema,
                        context,
                        fileContainingReference,
                        ...(shouldDeclareInline
                            ? { declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME) }
                            : {}),
                        namespace,
                        declarationDepth: 0
                    }),
                    allowMultiple: false
                };
            }
            return undefined;
        }
        return {
            value: buildTypeReference({
                schema,
                context,
                fileContainingReference,
                namespace,
                declarationDepth: 0
            }),
            allowMultiple: false
        };
    }

    if (schema.type === "array") {
        return {
            value: buildTypeReference({
                schema: Schema.optional({
                    nameOverride: schema.nameOverride,
                    generatedName: schema.generatedName,
                    title: schema.title,
                    value: schema.value,
                    description: schema.description,
                    availability: schema.availability,
                    namespace: undefined,
                    groupName: undefined,
                    inline: schema.inline
                }),
                context,
                fileContainingReference,
                namespace,
                declarationDepth: 0
            }),
            allowMultiple: true
        };
    } else {
        return {
            value: buildTypeReference({
                schema,
                context,
                fileContainingReference,
                namespace,
                declarationDepth: 0
            }),
            allowMultiple: false
        };
    }
}

function hasSamePrimitiveValueType({ array, primitive }: { array: Schema; primitive: Schema }): boolean {
    return (
        array?.type === "array" &&
        array.value.type === "primitive" &&
        primitive?.type === "primitive" &&
        array.value.schema.type === primitive.schema.type
    );
}

type RawTypeReferenceDetailed = Exclude<RawSchemas.TypeReferenceSchema, string>;

function isRawTypeReferenceDetailedSchema(
    rawTypeReference: RawSchemas.TypeReferenceSchema
): rawTypeReference is RawTypeReferenceDetailed {
    return typeof rawTypeReference === "object" && rawTypeReference !== null && "type" in rawTypeReference;
}

function isOrContainsReferenceSchema(schema: Schema): boolean {
    if (schema.type === "reference") {
        return true;
    }
    if (schema.type === "optional" || schema.type === "nullable") {
        return isOrContainsReferenceSchema(schema.value);
    }
    return false;
}
