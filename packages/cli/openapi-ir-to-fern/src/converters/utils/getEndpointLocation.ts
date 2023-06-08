import { RelativeFilePath } from "@fern-api/fs-utils";
import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/project-configuration";
import { Endpoint } from "@fern-fern/openapi-ir-model/ir";
import { camelCase, compact, isEqual, words } from "lodash-es";

export interface EndpointLocation {
    file: RelativeFilePath;
    endpointId: string;
    tag?: string;
}

export function getEndpointLocation(endpoint: Endpoint): EndpointLocation {
    if (endpoint.sdkName != null) {
        const filename =
            endpoint.sdkName.groupName.length === 0
                ? "__package__.yml"
                : `${endpoint.sdkName.groupName.map((part) => camelCase(part)).join("/")}.yml`;
        return {
            file: RelativeFilePath.of(filename),
            endpointId: endpoint.sdkName.methodName,
        };
    }

    const tag = endpoint.tags[0];
    const operationId = endpoint.operationId;

    if (operationId == null) {
        throw new Error(
            `${endpoint.method} ${endpoint.path} must specify either operationId or x-fern-sdk-method-name`
        );
    }

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null) {
        return {
            file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            endpointId: operationId,
        };
    }

    // if both tag and operation ids are defined
    const tagTokens = tokenizeString(tag);
    const operationIdTokens = tokenizeString(operationId);

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
                tag,
            };
        }
    }

    if (fileParts.length >= operationIdTokens.length) {
        throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
    }

    return {
        file: RelativeFilePath.of(camelCase(fileParts.join("_")) + ".yml"),
        endpointId: camelCase(operationIdTokens.slice(fileParts.length).join("_")),
        tag,
    };
}

function tokenizeString(input: string): string[] {
    // Handle camel case and snake case
    let tokens = input.split(/(?=[A-Z])|_| /);

    // Remove non-alphanumeric characters from each token
    tokens = tokens.map((token) => words(token).join(""));

    // Filter out empty tokens
    tokens = compact(tokens);

    return tokens;
}
