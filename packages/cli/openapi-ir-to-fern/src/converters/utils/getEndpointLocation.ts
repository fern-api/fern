import { RelativeFilePath } from "@fern-api/fs-utils";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { camelCase } from "lodash-es";

export interface EndpointLocation {
    file: RelativeFilePath;
    endpointId: string;
}

export function getEndpointLocation(endpoint: Endpoint): EndpointLocation {
    const tag = endpoint.tags[0];
    const operationId = endpoint.operationId;

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null) {
        return {
            file: RelativeFilePath.of("__package__.yml"),
            endpointId: operationId,
        };
    }

    // if both tag and operation ids are defined
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
            const camelCasedTag = camelCase(tag);
            return {
                file: RelativeFilePath.of(`${camelCasedTag}.yml`),
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
