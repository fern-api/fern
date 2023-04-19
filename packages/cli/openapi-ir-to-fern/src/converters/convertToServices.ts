import { RelativeFilePath } from "@fern-api/fs-utils";
import { RawSchemas } from "@fern-api/yaml-schema";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { convertToHttpMethod } from "./convertToHttpMethod";

export function convertToServices(endpoints: Endpoint[]): Record<RelativeFilePath, RawSchemas.HttpServiceSchema> {
    const services: Record<RelativeFilePath, RawSchemas.HttpServiceSchema> = {};
    for (const endpoint of endpoints) {
        const endpointId = getEndpointId(endpoint);
        if (!(endpointId.file in services)) {
            services[endpointId.file] = {
                auth: false,
                "base-path": "",
                endpoints: {},
            };
        }
        const service = services[endpointId.file];
        if (service != null) {
            service.endpoints[endpointId.id] = {
                path: endpoint.path,
                method: convertToHttpMethod(endpoint.method),
            };
        }
    }
    return services;
}

interface EndpointId {
    file: RelativeFilePath;
    id: string;
}

function getEndpointId(endpoint: Endpoint): EndpointId {
    const tag = endpoint.tags[0];
    const operationId = endpoint.operationId;

    // if tag and operation id are null, throw
    if (tag == null && operationId == null) {
        throw new Error("Endpoint has both tag and operation id as null. Cannot import");
    }

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null && operationId != null) {
        return {
            file: RelativeFilePath.of("__package__.yml"),
            id: operationId,
        };
    }

    // if tag is not null and operation is null, add to a <tag>.yml with method
    if (tag != null && operationId == null) {
        return {
            file: RelativeFilePath.of(tag),
            id: endpoint.method.toLocaleLowerCase(),
        };
    }

    // if both tag and operation ids are defined
    if (tag != null && operationId != null) {
        if (tag === operationId) {
            return {
                file: RelativeFilePath.of("__package__.yml"),
                id: tag,
            };
        }

        //  then diff them to get file + id
        const splitTag = tag.split(/[^a-zA-Z0-9]+/);
        const splitEndpointId = operationId.split(/[^a-zA-Z0-9]+/);

        if (JSON.stringify(splitTag) === JSON.stringify(splitEndpointId)) {
            return {
                file: RelativeFilePath.of("__package__.yml"),
                id: tag,
            };
        }

        const file: string[] = [];
        for (let i = 0; i < splitTag.length; ++i) {
            const tagElement = splitTag[i];
            if (tagElement != null && tagElement === splitEndpointId[i]) {
                file.push(tagElement);
            } else {
                throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
            }
        }

        if (file.length >= splitEndpointId.length) {
            throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
        }

        return {
            file: RelativeFilePath.of(file.join("_")),
            id: splitEndpointId.slice(file.length).join("_"),
        };
    }

    throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
}
