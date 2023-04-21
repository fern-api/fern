import { RelativeFilePath } from "@fern-api/fs-utils";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";

export interface EndpointLocation {
    file: RelativeFilePath;
    endpointId: string;
}

export function getEndpointLocation(endpoint: Endpoint): EndpointLocation {
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
            endpointId: operationId,
        };
    }

    // if tag is not null and operation is null, add to a <tag>.yml with method
    if (tag != null && operationId == null) {
        return {
            file: RelativeFilePath.of(tag),
            endpointId: endpoint.method.toLocaleLowerCase(),
        };
    }

    // if both tag and operation ids are defined
    if (tag != null && operationId != null) {
        const tagTokens = tag.split(/[^a-zA-Z0-9]+/);
        const operationIdTokens = operationId.split(/[^a-zA-Z0-9]+/);

        // add to __package__.yml if equal
        if (JSON.stringify(tagTokens) === JSON.stringify(operationIdTokens)) {
            return {
                file: RelativeFilePath.of("__package__.yml"),
                endpointId: tag,
            };
        }

        const file: string[] = [];
        for (let i = 0; i < tagTokens.length; ++i) {
            const tagElement = tagTokens[i];
            if (tagElement != null && tagElement === operationIdTokens[i]) {
                file.push(tagElement);
            } else {
                // tag and operation id don't overlap, so just return operation id
                return {
                    file: RelativeFilePath.of("__package__.yml"),
                    endpointId: operationId,
                };
            }
        }

        if (file.length >= operationIdTokens.length) {
            throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
        }

        return {
            file: RelativeFilePath.of(file.join("_")),
            endpointId: operationIdTokens.slice(file.length).join("_"),
        };
    }

    throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
}
