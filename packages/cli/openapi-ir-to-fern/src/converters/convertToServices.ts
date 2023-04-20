import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { PACKAGE_YML } from "../convert";
import { convertEndpoint } from "./convertEndpoint";
import { getEndpointLocation } from "./utils/getEndpointLocation";

export function convertToServices(endpoints: Endpoint[]): Record<RelativeFilePath, RawSchemas.HttpServiceSchema> {
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
            service.endpoints[endpointId] = convertEndpoint({
                endpoint,
                isPackageYml: file === PACKAGE_YML,
            });
        }
    }
    return services;
}

function getEmptyService(): RawSchemas.HttpServiceSchema {
    return {
        auth: false,
        "base-path": "",
        endpoints: {},
    };
}
