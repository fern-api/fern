import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/finalIr";
import { EXTERNAL_AUDIENCE } from "../convertPackage";
import { Environments } from "../getEnvironments";
import { convertEndpoint } from "./convertEndpoint";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export interface ConvertedServices {
    services: Record<RelativeFilePath, ConvertedService>;
    schemaIdsToExclude: string[];
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export interface ConvertedService {
    value: RawSchemas.HttpServiceSchema;
    docs?: string;
}

export function convertToServices({
    openApiFile,
    environments,
    globalHeaderNames,
}: {
    openApiFile: OpenAPIIntermediateRepresentation;
    environments: Environments | undefined;
    globalHeaderNames: Set<string>;
}): ConvertedServices {
    const { endpoints, schemas, nonRequestReferencedSchemas } = openApiFile;
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    let schemaIdsToExclude: string[] = [];
    const services: Record<RelativeFilePath, ConvertedService> = {};
    for (const endpoint of endpoints) {
        const { endpointId, file, tag } = getEndpointLocation(endpoint);
        if (!(file in services)) {
            const serviceTag = tag == null ? undefined : openApiFile.tags[tag];
            const emptyService = getEmptyService();
            if (serviceTag?.id != null) {
                emptyService["display-name"] = serviceTag.id;
            }
            services[file] = {
                value: emptyService,
                docs: serviceTag?.description ?? undefined,
            };
        }
        const service = services[file];
        if (service != null) {
            if (endpointId in service.value.endpoints) {
                throw new Error(
                    `The OpenAPI Spec has conflicting sdk method names. See ${endpoint.method.toUpperCase()} ${
                        endpoint.path
                    }`
                );
            }
            const convertedEndpoint = convertEndpoint({
                endpoint,
                isPackageYml: file === FERN_PACKAGE_MARKER_FILENAME,
                schemas,
                environments,
                nonRequestReferencedSchemas,
                globalHeaderNames,
                errors: openApiFile.errors,
            });
            additionalTypeDeclarations = {
                ...additionalTypeDeclarations,
                ...convertedEndpoint.additionalTypeDeclarations,
            };
            schemaIdsToExclude = [...schemaIdsToExclude, ...convertedEndpoint.schemaIdsToExclude];
            let endpointDefinition = convertedEndpoint.value;
            if (endpoint.audiences.length > 0) {
                endpointDefinition = {
                    ...endpointDefinition,
                    audiences: endpoint.audiences,
                };
            } else if (openApiFile.hasEndpointsMarkedInternal && (endpoint.internal == null || !endpoint.internal)) {
                endpointDefinition = {
                    ...endpointDefinition,
                    audiences: [EXTERNAL_AUDIENCE],
                };
            }
            service.value.endpoints[endpointId] = endpointDefinition;
        }
    }
    return {
        services,
        schemaIdsToExclude,
        additionalTypeDeclarations,
    };
}

function getEmptyService(): RawSchemas.HttpServiceSchema {
    return {
        auth: false,
        "base-path": "",
        endpoints: {},
    };
}
