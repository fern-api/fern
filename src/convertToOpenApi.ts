import { DeclaredTypeName, IntermediateRepresentation, TypeDeclaration } from "@fern-fern/ir-model";
import { OpenAPIV3 } from "openapi-types";
import { convertServices } from "./converters/servicesConverter";
import { convertType } from "./converters/typeConverter";

export function convertToOpenApi(
    apiName: string,
    apiVersion: string,
    ir: IntermediateRepresentation
): OpenAPIV3.Document<{}> | undefined {
    let typesByName: Record<string, TypeDeclaration> = {};
    let schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};
    ir.types.forEach((typeDeclaration) => {
        // convert type to open api schema
        const convertedType = convertType(typeDeclaration);
        schemas[convertedType.schemaName] = convertedType.openApiSchema;
        // populates typesByName map
        typesByName[getDeclaredTypeNameKey(typeDeclaration.name)] = typeDeclaration;
    });
    const paths = convertServices(ir.services.http, typesByName);
    return {
        openapi: "3.0.1",
        info: {
            title: apiName,
            version: apiVersion,
        },
        paths,
        components: {
            schemas,
        },
    };
}

export function getDeclaredTypeNameKey(declaredTypeName: DeclaredTypeName): string {
    return `${declaredTypeName.fernFilepath}-${declaredTypeName.name}`;
}
