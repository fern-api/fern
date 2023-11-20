import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import type { Endpoint } from "@fern-fern/openapi-ir-model/finalIr";
import { OpenAPIIntermediateRepresentation } from "@fern-fern/openapi-ir-model/finalIr";
import { EXTERNAL_AUDIENCE } from "../convertPackage";
import { Environments } from "../getEnvironments";
import { OpenApiIrConverterContext } from "../OpenApiIrConverterContext";
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
    context,
}: {
    openApiFile: OpenAPIIntermediateRepresentation;
    environments: Environments | undefined;
    globalHeaderNames: Set<string>;
    context: OpenApiIrConverterContext;
}): ConvertedServices {
    const { endpoints, schemas, nonRequestReferencedSchemas } = openApiFile;
    let additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema> = {};
    let schemaIdsToExclude: string[] = [];
    const services: Record<RelativeFilePath, ConvertedService> = {};
    const methodOverlaps: Record<string, Endpoint[]> = {};
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
            if (endpointId in service.value.endpoints && methodOverlaps[endpointId] === undefined) {
                methodOverlaps[endpointId] = endpoints.filter((e) => e.sdkName?.methodName === endpointId);
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

    logOverlappingMethodNames(context, methodOverlaps);
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

function logOverlappingMethodNames(context: OpenApiIrConverterContext, endpoints: Record<string, Endpoint[]>) {
    if (!endpoints) {
        return;
    }

    for (const key in endpoints) {
        const value = endpoints[key];
        context.logger.error(`Multiple endpoints have conflicting names for '${key}':`);
        value?.forEach((e) => {
            // TODO: Add line numbers of overlapping methods
            context.logger.error(`- ${e.method.toUpperCase()} ${e.path}`);
        });
    }
    context.logger.error("You can change the names using operationId or the extension `x-fern-sdk-method-name`.");
}
