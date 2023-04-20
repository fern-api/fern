import { RawSchemas } from "@fern-api/yaml-schema";
import { QueryParameter } from "@fern-fern/openapi-ir-model/ir";
import { convertToTypeReference } from "./convertToTypeReference";

export interface ConvertedQueryParameter {
    value: RawSchemas.HttpQueryParameterSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertQueryParameter(queryParameter: QueryParameter): ConvertedQueryParameter {
    const typeReference = convertToTypeReference(queryParameter.schema);
    return {
        value: {
            docs: queryParameter.description ?? undefined,
            type: typeReference.typeReference,
        },
        additionalTypeDeclarations: typeReference.additionalTypeDeclarations,
    };
}
