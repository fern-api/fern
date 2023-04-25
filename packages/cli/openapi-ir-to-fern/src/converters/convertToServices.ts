import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint, Schema, SchemaId } from "@fern-fern/openapi-ir-model/ir";
import { PACKAGE_YML } from "../convertPackage";
import { Environment } from "../getEnvironment";
import { convertEndpoint } from "./convertEndpoint";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export interface ConvertedServices {
    services: Record<RelativeFilePath, RawSchemas.HttpServiceSchema>;
    schemaIdsToExclude: string[];
}

export function convertToServices(
    endpoints: Endpoint[],
    schemas: Record<SchemaId, Schema>,
    environment: Environment | undefined
): ConvertedServices {
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
                isPackageYml: file === PACKAGE_YML,
                schemas,
                environment,
            });
            schemaIdsToExclude = [...schemaIdsToExclude, ...convertedEndpoint.schemaIdsToExclude];
            service.endpoints[endpointId] = convertedEndpoint.value;
        }
    }
    return {
        services,
        schemaIdsToExclude,
    };
}

function getEmptyService(): RawSchemas.HttpServiceSchema {
    return {
        auth: true,
        "base-path": "",
        endpoints: {},
    };
}
