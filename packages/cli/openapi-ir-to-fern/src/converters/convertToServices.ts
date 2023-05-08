import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { RawSchemas } from "@fern-api/yaml-schema";
import { OpenAPIFile } from "@fern-fern/openapi-ir-model/ir";
import { Environment } from "../getEnvironment";
import { convertEndpoint } from "./convertEndpoint";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export interface ConvertedServices {
    services: Record<RelativeFilePath, RawSchemas.HttpServiceSchema>;
    schemaIdsToExclude: string[];
    additionalTypeDeclarations: Record<string, RawSchemas.TypeDeclarationSchema>;
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
    const services: Record<RelativeFilePath, RawSchemas.HttpServiceSchema> = {};
    for (const endpoint of endpoints) {
        const { endpointId, file } = getEndpointLocation(endpoint);
        if (!(file in services)) {
            services[file] = getEmptyService();
        }
        const service = services[file];
        if (service != null) {
            if (endpointId in service.endpoints) {
                throw new Error(`Encountered duplicate endpoint id ${endpointId} in file ${file}`);
            }
            const convertedEndpoint = convertEndpoint({
                endpoint,
                isPackageYml: file === FERN_PACKAGE_MARKER_FILENAME,
                schemas,
                environment,
                nonRequestReferencedSchemas,
                globalHeaderNames,
            });
            additionalTypeDeclarations = {
                ...additionalTypeDeclarations,
                ...convertedEndpoint.additionalTypeDeclarations,
            };
            schemaIdsToExclude = [...schemaIdsToExclude, ...convertedEndpoint.schemaIdsToExclude];
            service.endpoints[endpointId] = convertedEndpoint.value;
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
