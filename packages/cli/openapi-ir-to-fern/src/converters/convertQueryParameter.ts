import { RawSchemas } from "@fern-api/yaml-schema";
import { QueryParameter, Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { ROOT_PREFIX } from "../convertPackage";
import { convertToTypeReference, TypeReference } from "./convertToTypeReference";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface ConvertedQueryParameter {
    value: RawSchemas.HttpQueryParameterSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertQueryParameter({
    queryParameter,
    isPackageYml,
    schemas,
}: {
    queryParameter: QueryParameter;
    isPackageYml: boolean;
    schemas: Record<SchemaId, Schema>;
}): ConvertedQueryParameter {
    const typeReference = getQueryParameterTypeReference({ schema: queryParameter.schema, isPackageYml, schemas });
    return {
        value: {
            docs: queryParameter.description ?? undefined,
            type: getTypeFromTypeReference(typeReference.value.typeReference),
            "allow-multiple": typeReference.allowMultiple ? true : undefined,
        },
        additionalTypeDeclarations: typeReference.value.additionalTypeDeclarations,
    };
}

interface QueryParameterTypeReference {
    value: TypeReference;
    allowMultiple: boolean;
}

// TODO(dsinghvi): list query parameters are automatically converted to exploded=true,
// this may be the incorrect wire format
function getQueryParameterTypeReference({
    schema,
    isPackageYml,
    schemas,
}: {
    schema: Schema;
    isPackageYml: boolean;
    schemas: Record<SchemaId, Schema>;
}): QueryParameterTypeReference {
    const prefix = isPackageYml ? undefined : ROOT_PREFIX;

    if (schema.type === "reference") {
        const resolvedSchema = schemas[schema.schema];

        if (resolvedSchema == null) {
            throw new Error(`Failed to resolve schema=${schema.schema}`);
        }

        if (resolvedSchema.type === "array") {
            return {
                value: convertToTypeReference({
                    schema: Schema.optional({
                        value: resolvedSchema.value,
                        description: schema.description ?? resolvedSchema.description,
                    }),
                    prefix,
                    schemas,
                }),
                allowMultiple: true,
            };
        } else if (resolvedSchema.type === "oneOf") {
            // TODO(dsinghvi): HACKHACK picks first union type in oneOf for query params
            for (const [_, schema] of Object.entries(resolvedSchema.oneOf.schemas)) {
                return getQueryParameterTypeReference({
                    schema,
                    isPackageYml,
                    schemas,
                });
            }
        }
    }

    if (schema.type === "optional" || schema.type === "nullable") {
        if (schema.value.type === "reference") {
            const resolvedSchema = schemas[schema.value.schema];
            if (resolvedSchema == null) {
                throw new Error(`Failed to resolve schema=${schema.value.schema}`);
            }
            if (resolvedSchema.type === "array") {
                return {
                    value: convertToTypeReference({
                        schema: Schema.optional({
                            value: resolvedSchema.value,
                            description: schema.description ?? resolvedSchema.description,
                        }),
                        prefix,
                        schemas,
                    }),
                    allowMultiple: true,
                };
            }
        }
        if (schema.value.type === "array") {
            return {
                value: convertToTypeReference({
                    schema: Schema.optional({ value: schema.value.value, description: schema.description }),
                    prefix,
                    schemas,
                }),
                allowMultiple: true,
            };
        }
        return {
            value: convertToTypeReference({
                schema,
                prefix,
                schemas,
            }),
            allowMultiple: false,
        };
    }

    if (schema.type === "array") {
        return {
            value: convertToTypeReference({
                schema: Schema.optional({ value: schema.value, description: schema.description }),
                prefix,
                schemas,
            }),
            allowMultiple: true,
        };
    } else {
        return {
            value: convertToTypeReference({
                schema,
                prefix,
                schemas,
            }),
            allowMultiple: false,
        };
    }
}
