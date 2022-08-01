import { DeclaredTypeName, ErrorDeclaration, IntermediateRepresentation, TypeDeclaration } from "@fern-fern/ir-model";
import { OpenAPIV3 } from "openapi-types";
import { convertError } from "./converters/errorConverter";
import { convertServices } from "./converters/servicesConverter";
import { convertType } from "./converters/typeConverter";

export function convertToOpenApi(
    apiName: string,
    apiVersion: string,
    ir: IntermediateRepresentation
): OpenAPIV3.Document<{}> | undefined {
    let schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};

    let typesByName: Record<string, TypeDeclaration> = {};
    ir.types.forEach((typeDeclaration) => {
        // convert type to open api schema
        const convertedType = convertType(typeDeclaration);
        schemas[convertedType.schemaName] = convertedType.openApiSchema;
        // populates typesByName map
        typesByName[getDeclaredTypeNameKey(typeDeclaration.name)] = typeDeclaration;
    });

    let errorsByName: Record<string, ErrorDeclaration> = {};
    ir.errors.forEach((errorDeclaration) => {
        // convert error to open api schema
        const convertedError = convertError(errorDeclaration);
        schemas[convertedError.schemaName] = convertedError.openApiSchema;
        // populate errorsByname map
        errorsByName[getDeclaredTypeNameKey(errorDeclaration.name)] = errorDeclaration;
    });

    const paths = convertServices(ir.services.http, typesByName, errorsByName, ir.constants);
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
