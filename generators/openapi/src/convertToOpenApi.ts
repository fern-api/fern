import { OpenAPIV3 } from "openapi-types";

import {
    DeclaredErrorName,
    DeclaredTypeName,
    ErrorDeclaration,
    IntermediateRepresentation,
    TypeDeclaration
} from "@fern-fern/ir-sdk/api";

import { convertServices } from "./converters/servicesConverter";
import { convertType } from "./converters/typeConverter";
import { constructEndpointSecurity, constructSecuritySchemes } from "./security";
import { Mode } from "./writeOpenApi";

export function convertToOpenApi({
    apiName,
    ir,
    mode
}: {
    apiName: string;
    ir: IntermediateRepresentation;
    mode: Mode;
}): OpenAPIV3.Document | undefined {
    const schemas: Record<string, OpenAPIV3.ReferenceObject | OpenAPIV3.SchemaObject> = {};

    const typesByName: Record<string, TypeDeclaration> = {};
    Object.values(ir.types).forEach((typeDeclaration) => {
        // convert type to open api schema
        const convertedType = convertType(typeDeclaration, ir);
        schemas[convertedType.schemaName] = {
            title: convertedType.schemaName,
            ...convertedType.openApiSchema
        };
        // populates typesByName map
        typesByName[getDeclaredTypeNameKey(typeDeclaration.name)] = typeDeclaration;
    });

    const errorsByName: Record<string, ErrorDeclaration> = {};
    Object.values(ir.errors).forEach((errorDeclaration) => {
        errorsByName[getErrorTypeNameKey(errorDeclaration.name)] = errorDeclaration;
    });

    const security = constructEndpointSecurity(ir.auth);

    const paths = convertServices({
        ir,
        httpServices: Object.values(ir.services),
        typesByName,
        errorsByName,
        errorDiscriminationStrategy: ir.errorDiscriminationStrategy,
        security,
        environments: ir.environments ?? undefined,
        mode
    });

    const info: OpenAPIV3.InfoObject = {
        title: ir.apiDisplayName ?? apiName,
        version: ""
    };
    if (ir.apiDocs != null) {
        info.description = ir.apiDocs;
    }

    const openAPISpec: OpenAPIV3.Document = {
        openapi: "3.0.1",
        info,
        paths,
        components: {
            schemas,
            securitySchemes: constructSecuritySchemes(ir.auth)
        }
    };

    if (ir.environments != null && ir.environments.environments.type === "singleBaseUrl") {
        openAPISpec.servers = ir.environments.environments.environments.map((environment) => {
            return {
                url: environment.url,
                description:
                    environment.docs != null
                        ? `${environment.name.originalName} (${environment.docs})`
                        : environment.name.originalName
            };
        });
    }

    return openAPISpec;
}

export function getDeclaredTypeNameKey(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((part) => part.originalName),
        declaredTypeName.name.originalName
    ].join("-");
}

export function getErrorTypeNameKey(declaredErrorName: DeclaredErrorName): string {
    return [
        ...declaredErrorName.fernFilepath.allParts.map((part) => part.originalName),
        declaredErrorName.name.originalName
    ].join("-");
}
