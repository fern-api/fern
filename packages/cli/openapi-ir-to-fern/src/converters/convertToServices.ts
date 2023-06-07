import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIFile, Tag } from "@fern-fern/openapi-ir-model/ir";
import { EXTERNAL_AUDIENCE } from "../convertPackage";
import { Environment } from "../getEnvironment";
import { convertEndpoint } from "./convertEndpoint";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export interface ConvertedServices {
    services: Record<RelativeFilePath, ConvertedService>;
    schemaIdsToExclude: string[];
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
}

export interface ConvertedService {
    service: RawSchemas.HttpServiceSchema;
    docs?: string;
}

export function convertToServices({
    openApiFile,
    environment,
    globalHeaderNames,
}: {
    openApiFile: OpenAPIFile;
    environment: Environment | undefined;
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
            const emptyService = constructService({ tag: serviceTag });
            services[file] = emptyService;
        }
        const service = services[file];
        if (service != null) {
            if (endpointId in service.service.endpoints) {
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
                environment,
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
            if (openApiFile.hasEndpointsMarkedInternal && (endpoint.internal == null || !endpoint.internal)) {
                endpointDefinition = {
                    ...endpointDefinition,
                    audiences: [EXTERNAL_AUDIENCE],
                };
            }
            service.service.endpoints[endpointId] = endpointDefinition;
        }
    }
    return {
        services,
        schemaIdsToExclude,
        additionalTypeDeclarations,
    };
}

function constructService({ tag }: { tag?: Tag }): ConvertedService {
    const service: RawSchemas.HttpServiceSchema = {
        auth: false,
        "base-path": "",
        endpoints: {},
    };
    if (tag != null) {
        service["display-name"] = tag.id;
    }
    return {
        service,
        docs: tag?.description ?? undefined,
    };
}
