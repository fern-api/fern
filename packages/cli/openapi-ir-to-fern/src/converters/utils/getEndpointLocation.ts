import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { camelCase, isEqual } from "lodash-es";

export interface EndpointLocation {
    file: RelativeFilePath;
    endpointId: string;
}

export function getEndpointLocation(endpoint: Endpoint): EndpointLocation {
    if (endpoint.sdkName != null) {
        const filename =
            endpoint.sdkName.groupName == null ? "__package__.yml" : `${camelCase(endpoint.sdkName.groupName)}.yml`;
        return {
            file: RelativeFilePath.of(filename),
            endpointId: endpoint.sdkName.methodName,
        };
    }

    const tag = endpoint.tags[0];
    const operationId = endpoint.operationId;

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null) {
        return {
            file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            endpointId: operationId,
        };
    }

    // if both tag and operation ids are defined
    const tagTokens = tag.split(/[^a-zA-Z0-9]+/);
    const operationIdTokens = operationId.split(/[^a-zA-Z0-9]+/);

    // add to __package__.yml if equal
    if (isEqual(tagTokens, operationIdTokens)) {
        return {
            file: RelativeFilePath.of("__package__.yml"),
            endpointId: tag,
        };
    }

    const fileParts: string[] = [];
    for (let i = 0; i < tagTokens.length; ++i) {
        const tagElement = tagTokens[i];
        if (tagElement != null && tagElement === operationIdTokens[i]) {
            fileParts.push(tagElement);
        } else {
            // tag and operation id don't overlap, so just return operation id
            const camelCasedTag = camelCase(tag);
            return {
                file: RelativeFilePath.of(`${camelCasedTag}.yml`),
                endpointId: operationId,
            };
        }
    }

    if (fileParts.length >= operationIdTokens.length) {
        throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
    }

    return {
        file: RelativeFilePath.of(camelCase(fileParts.join("_")) + ".yml"),
        endpointId: camelCase(operationIdTokens.slice(fileParts.length).join("_")),
    };
}
