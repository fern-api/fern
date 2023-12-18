import { RelativeFilePath } from "@fern-api/fs-utils";
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

    const queryParameterType = getTypeFromTypeReference(typeReference.value);
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
                        value: resolvedSchema.value,
                        description: schema.description ?? resolvedSchema.description,
                        groupName: undefined
                    }),
                    context,
                    fileContainingReference
                }),
                allowMultiple: true
            };
        } else if (resolvedSchema.type === "oneOf" && resolvedSchema.oneOf.type === "undisciminated") {
            // TODO(dsinghvi): HACKHACK picks first union type in oneOf for query params
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
                            value: resolvedSchema.value,
                            description: schema.description ?? resolvedSchema.description,
                            groupName: undefined
                        }),
                        context,
                        fileContainingReference
                    }),
                    allowMultiple: true
                };
            }
        }
        if (schema.value.type === "array") {
            return {
                value: buildTypeReference({
                    schema: Schema.optional({
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
            // TODO(dsinghvi): HACKHACK picks first union type in oneOf for query params
            for (const [_, oneOfSchema] of Object.entries(schema.value.oneOf.schemas)) {
                return getQueryParameterTypeReference({
                    schema: Schema.optional({ value: oneOfSchema, description: undefined, groupName: undefined }),
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
                schema: Schema.optional({ value: schema.value, description: schema.description, groupName: undefined }),
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
