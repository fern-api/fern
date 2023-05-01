import { RawSchemas } from "@fern-api/yaml-schema";
import { QueryParameter, Schema } from "@fern-fern/openapi-ir-model/ir";
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
}: {
    queryParameter: QueryParameter;
    isPackageYml: boolean;
}): ConvertedQueryParameter {
    const typeReference = getQueryParameterTypeReference({ schema: queryParameter.schema, isPackageYml });
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
}: {
    schema: Schema;
    isPackageYml: boolean;
}): QueryParameterTypeReference {
    const prefix = isPackageYml ? undefined : ROOT_PREFIX;
    if (schema.type === "optional") {
        if (schema.value.type === "array") {
            return {
                value: convertToTypeReference({
                    schema: Schema.optional({ value: schema.value.value, description: schema.description }),
                    prefix,
                }),
                allowMultiple: true,
            };
        }
        return {
            value: convertToTypeReference({
                schema,
                prefix,
            }),
            allowMultiple: false,
        };
    }

    if (schema.type === "array") {
        return {
            value: convertToTypeReference({
                schema: Schema.optional({ value: schema.value, description: schema.description }),
                prefix,
            }),
            allowMultiple: true,
        };
    } else {
        return {
            value: convertToTypeReference({
                schema,
                prefix,
            }),
            allowMultiple: false,
        };
    }
}
