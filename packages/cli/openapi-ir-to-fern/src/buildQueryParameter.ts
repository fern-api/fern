import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { QueryParameter, Schema } from "@fern-fern/openapi-ir-model/finalIr";
import { buildTypeReference } from "./buildTypeReference";
import { OpenApiIrConverterContext } from "./OpenApiIrConverterContext";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export function buildQueryParameter({
    queryParameter,
    context,
    fileContainingReference
}: {
    queryParameter: QueryParameter;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
}): RawSchemas.HttpQueryParameterSchema | undefined {
    const typeReference = getQueryParameterTypeReference({
        schema: queryParameter.schema,
        context,
        fileContainingReference
    });
    if (typeReference == null) {
        return undefined;
    }

    let queryParameterType = getTypeFromTypeReference(typeReference.value);

    // we can assume unknown-typed query parameteters are strings by default
    if (queryParameterType === "unknown") {
        queryParameterType = "string";
    } else if (queryParameterType === "optional<unknown>") {
        queryParameterType = "optional<string>";
    }

    if (
        queryParameter.description == null &&
        !typeReference.allowMultiple &&
        queryParameter.parameterNameOverride == null
    ) {
        return queryParameterType;
    }

    const queryParameterSchema: RawSchemas.HttpQueryParameterSchema = {
        type: queryParameterType
    };

    if (typeReference.allowMultiple) {
        queryParameterSchema["allow-multiple"] = true;
    }

    if (queryParameter.description != null) {
        queryParameterSchema.docs = queryParameter.description;
    }

    if (queryParameter.parameterNameOverride != null) {
        queryParameterSchema.name = queryParameter.parameterNameOverride;
    }

    return queryParameterSchema;
}

interface QueryParameterTypeReference {
    value: RawSchemas.TypeReferenceWithDocsSchema;
    allowMultiple: boolean;
}

// TODO(dsinghvi): list query parameters are automatically converted to exploded=true,
// this may be the incorrect wire format
function getQueryParameterTypeReference({
    schema,
    context,
    fileContainingReference
}: {
    schema: Schema;
    context: OpenApiIrConverterContext;
    fileContainingReference: RelativeFilePath;
}): QueryParameterTypeReference | undefined {
    if (schema.type === "reference") {
        const resolvedSchema = context.getSchema(schema.schema);
        if (resolvedSchema.type === "array") {
            return {
                value: buildTypeReference({
                    schema: Schema.optional({
                        nameOverride: schema.nameOverride,
                        generatedName: schema.generatedName,
                        value: resolvedSchema.value,
                        description: schema.description ?? resolvedSchema.description,
                        groupName: undefined
                    }),
                    context,
                    declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
                    fileContainingReference
                }),
                allowMultiple: true
            };
        } else if (resolvedSchema.type === "oneOf" && resolvedSchema.oneOf.type === "undisciminated") {
            // Try to generated enum from literal values
            const literalValues = [];
            for (const [_, schema] of Object.entries(resolvedSchema.oneOf.schemas)) {
                if (schema.type === "literal" && schema.value.type === "string") {
                    literalValues.push(schema.value.string);
                }
            }

            if (literalValues.length > 0) {
                context.builder.addType(fileContainingReference, {
                    name: schema.generatedName,
                    schema: { enum: literalValues }
                });
                return {
                    value: schema.generatedName,
                    allowMultiple: false
                };
            }

            // If no literal values, just pick the first schema of the undiscriminated union
            for (const [_, schema] of Object.entries(resolvedSchema.oneOf.schemas)) {
                return getQueryParameterTypeReference({
                    schema,
                    context,
                    fileContainingReference
                });
            }
        } else if (resolvedSchema.type === "object") {
            return undefined;
        }
    }

    if (schema.type === "optional" || schema.type === "nullable") {
        if (schema.value.type === "reference") {
            const resolvedSchema = context.getSchema(schema.value.schema);
            if (resolvedSchema.type === "array") {
                return {
                    value: buildTypeReference({
                        schema: Schema.optional({
                            nameOverride: schema.nameOverride,
                            generatedName: schema.generatedName,
                            value: resolvedSchema.value,
                            description: schema.description ?? resolvedSchema.description,
                            groupName: undefined
                        }),
                        context,
                        fileContainingReference,
                        declarationFile: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME)
                    }),
                    allowMultiple: true
                };
            }
        }
        if (schema.value.type === "array") {
            return {
                value: buildTypeReference({
                    schema: Schema.optional({
                        nameOverride: schema.nameOverride,
                        generatedName: schema.generatedName,
                        value: schema.value.value,
                        description: schema.description,
                        groupName: undefined
                    }),
                    context,
                    fileContainingReference
                }),
                allowMultiple: true
            };
        } else if (schema.value.type === "oneOf" && schema.value.oneOf.type === "undisciminated") {
            // Try to generated enum from literal values
            const literalValues = [];
            for (const [_, oneOfSchema] of Object.entries(schema.value.oneOf.schemas)) {
                if (oneOfSchema.type === "literal" && oneOfSchema.value.type === "string") {
                    literalValues.push(oneOfSchema.value.string);
                }
            }

            if (literalValues.length > 0) {
                context.builder.addType(fileContainingReference, {
                    name: schema.value.oneOf.generatedName,
                    schema: { enum: literalValues }
                });
                return {
                    value: `optional<${schema.value.oneOf.generatedName}>`,
                    allowMultiple: false
                };
            }

            // If no literal values, just pick the first schema of the undiscriminated union
            for (const [_, oneOfSchema] of Object.entries(schema.value.oneOf.schemas)) {
                return getQueryParameterTypeReference({
                    schema: Schema.optional({
                        nameOverride: schema.nameOverride,
                        generatedName: schema.generatedName,
                        value: oneOfSchema,
                        description: undefined,
                        groupName: undefined
                    }),
                    context,
                    fileContainingReference
                });
            }
        } else if (schema.value.type === "object") {
            return undefined;
        }
        return {
            value: buildTypeReference({
                schema,
                context,
                fileContainingReference
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
                    value: schema.value,
                    description: schema.description,
                    groupName: undefined
                }),
                context,
                fileContainingReference
            }),
            allowMultiple: true
        };
    } else {
        return {
            value: buildTypeReference({
                schema,
                context,
                fileContainingReference
            }),
            allowMultiple: false
        };
    }
}
