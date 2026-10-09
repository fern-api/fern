import {
    DeclaredErrorName,
    DeclaredTypeName,
    ErrorDeclaration,
    IntermediateRepresentation,
    TypeDeclaration
} from "@fern-api/ir-sdk";
import { getOriginalName } from "@fern-api/ir-utils";
import { OpenAPIV3 } from "openapi-types";
import { convertServices } from "./converters/servicesConverter.js";
import { convertType } from "./converters/typeConverter.js";
import { constructEndpointSecurity, constructSecuritySchemes } from "./security.js";

export type Mode = "stoplight" | "openapi";

export function convertIrToOpenApi({
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

    if (ir.environments != null) {
        const envs = ir.environments.environments;
        if (envs.type === "singleBaseUrl") {
            openAPISpec.servers = envs.environments.map((environment) => {
                return {
                    url: environment.url,
                    description:
                        environment.docs != null
                            ? `${getOriginalName(environment.name)} (${environment.docs})`
                            : getOriginalName(environment.name)
                };
            });
        } else if (envs.type === "multipleBaseUrls") {
            const servers: OpenAPIV3.ServerObject[] = [];
            for (const environment of envs.environments) {
                const envName = getOriginalName(environment.name);
                for (const baseUrlDef of envs.baseUrls) {
                    const url = environment.urls[baseUrlDef.id];
                    if (url != null) {
                        const urlName = getOriginalName(baseUrlDef.name);
                        servers.push({
                            url,
                            description:
                                environment.docs != null
                                    ? `${envName} - ${urlName} (${environment.docs})`
                                    : `${envName} (${urlName})`
                        });
                    }
                }
            }
            if (servers.length > 0) {
                openAPISpec.servers = servers;
            }
        }
    }

    return openAPISpec;
}

export function getDeclaredTypeNameKey(declaredTypeName: DeclaredTypeName): string {
    return [
        ...declaredTypeName.fernFilepath.allParts.map((part) => getOriginalName(part)),
        getOriginalName(declaredTypeName.name)
    ].join("-");
}

export function getErrorTypeNameKey(declaredErrorName: DeclaredErrorName): string {
    return [
        ...declaredErrorName.fernFilepath.allParts.map((part) => getOriginalName(part)),
        getOriginalName(declaredErrorName.name)
    ].join("-");
}
