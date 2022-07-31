import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { OpenAPIV3 } from "openapi-types";
import { convertType } from "./converters/typeConverter";

export function convertToOpenApi(
    apiName: string,
    apiVersion: string,
    ir: IntermediateRepresentation
): OpenAPIV3.Document<{}> | undefined {
    let schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};
    ir.types.forEach((typeDeclaration) => {
        const convertedType = convertType(typeDeclaration);
        schemas[convertedType.schemaName] = convertedType.openApiSchema;
    });
    return {
        openapi: "3.0.1",
        info: {
            title: apiName,
            version: apiVersion,
        },
        paths: {},
        components: {
            schemas,
        },
    };
}
