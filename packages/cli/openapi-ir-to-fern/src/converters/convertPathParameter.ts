import { RawSchemas } from "@fern-api/yaml-schema";
import { PathParameter, Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { convertToTypeReference } from "./convertToTypeReference";
import { getTypeFromTypeReference } from "./utils/getTypeFromTypeReference";

export interface ConvertedPathParameter {
    value: RawSchemas.HttpPathParameterSchema;
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export function convertPathParameter({
    pathParameter,
    schemas,
}: {
    pathParameter: PathParameter;
    schemas: Record<SchemaId, Schema>;
}): ConvertedPathParameter {
    const typeReference = convertToTypeReference({
        schema: pathParameter.schema,
        schemas,
    });
    return {
        value: {
            docs: pathParameter.description ?? undefined,
            type: getTypeFromTypeReference(typeReference.typeReference),
        },
        additionalTypeDeclarations: typeReference.additionalTypeDeclarations,
    };
}
