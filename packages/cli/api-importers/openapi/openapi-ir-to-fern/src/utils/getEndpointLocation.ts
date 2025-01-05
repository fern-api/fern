import { camelCase, compact, isEqual } from "lodash-es";

import { FERN_PACKAGE_MARKER_FILENAME } from "@fern-api/configuration";
import { Endpoint, HttpMethod } from "@fern-api/openapi-ir";
import { RelativeFilePath, join } from "@fern-api/path-utils";

import { convertEndpointSdkNameToFileWithoutExtension } from "./convertSdkGroupName";

export interface EndpointLocation {
    file: RelativeFilePath;
    endpointId: string;
    tag?: string;
}

function resolveEndpointLocationWithNamespaceOverride({
    location,
    namespaceOverride
}: {
    location: EndpointLocation;
    namespaceOverride: string | undefined;
}): EndpointLocation {
    if (namespaceOverride != null) {
        return {
            ...location,
            file: join(RelativeFilePath.of(namespaceOverride), location.file)
        };
    }
    return location;
}

function getUnresolvedEndpointLocation(endpoint: Endpoint): EndpointLocation {
    const namespace = endpoint.namespace;

    // Ignore the namespace tag as we'll apply that later, universally
    const tag = endpoint.tags.filter((tag) => tag !== namespace)[0];
    const operationId = endpoint.operationId;

    if (operationId == null) {
        if (tag != null) {
            return {
                file: RelativeFilePath.of(`${camelCase(tag)}.yml`),
                endpointId:
                    endpoint.summary != null
                        ? camelCase(endpoint.summary)
                        : camelCase(`${endpoint.method}_${endpoint.path.split("/").join("_")}`)
            };
        }

        // If no operation id and tag, use summary to generate id
        if (endpoint.summary != null) {
            return {
                file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
                endpointId: camelCase(endpoint.summary)
            };
        }

        // TODO(dsinghvi): warn that using path and method to generate id
        return {
            file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            endpointId: camelCase(`${endpoint.method}_${endpoint.path.split("/").join("_")}`)
        };
    }

    // if tag is null and operation is defined, add to __package__.yml
    if (tag == null) {
        return {
            file: RelativeFilePath.of(FERN_PACKAGE_MARKER_FILENAME),
            endpointId: operationId
        };
    }

    // if both tag and operation ids are defined
    const tagTokens = tokenizeString(tag);
    const operationIdTokens = tokenizeString(operationId);

    // add to __package__.yml if equal
    if (isEqual(tagTokens, operationIdTokens)) {
        return {
            file: RelativeFilePath.of("__package__.yml"),
            endpointId: tag
        };
    }

    // if operation id matches fastapi then generate endpoint location
    const fastapiEndpointLocation = maybeGetFastApiEndpointLocation({
        operationId,
        tag,
        path: endpoint.path,
        method: endpoint.method
    });
    if (fastapiEndpointLocation != null) {
        return fastapiEndpointLocation;
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
                tag
            };
        }
    }

    if (fileParts.length >= operationIdTokens.length) {
        throw new Error(`Cannot get file for endpoint ${JSON.stringify(endpoint)}`);
    }

    return {
        file: RelativeFilePath.of(camelCase(fileParts.join("_")) + ".yml"),
        endpointId: camelCase(operationIdTokens.slice(fileParts.length).join("_")),
        tag
    };
}

export function getEndpointLocation(endpoint: Endpoint): EndpointLocation {
    const tag = endpoint.tags[0];
    if (endpoint.sdkName != null) {
        const filenameWithoutExtension = convertEndpointSdkNameToFileWithoutExtension({
            sdkName: endpoint.sdkName,
            namespaceOverride: endpoint.namespace
        });
        const filename = `${filenameWithoutExtension}.yml`;
        // only if the tag lines up with `x-fern-sdk-group-name` do we use it
        const isTagApplicable = filenameWithoutExtension.toLowerCase() === tag?.toLowerCase().replaceAll(" ", "");
        return {
            file: RelativeFilePath.of(filename),
            endpointId: endpoint.sdkName.methodName,
            // only if the tag lines up with `x-fern-sdk-group-name` do we use it
            tag: isTagApplicable ? tag : undefined
        };
    }

    return resolveEndpointLocationWithNamespaceOverride({
        namespaceOverride: endpoint.namespace,
        location: getUnresolvedEndpointLocation(endpoint)
    });
}

export function tokenizeString(input: string): string[] {
    let tokens: string[];

    // Check if the string is in camel case or Pascal case
    if (/^[a-z]+(?:[A-Z][a-z]+)*$/.test(input)) {
        // Camel case or Pascal case: Split based on capital letters
        tokens = input.split(/(?=[A-Z])/);
    } else {
        // Snake case or non-alphanumeric separators: Split based on non-alphanumeric characters
        tokens = input.split(/[^a-zA-Z0-9]+/);
    }

    tokens = tokens.map((token) => token.toLowerCase());

    // Filter out empty tokens
    tokens = compact(tokens);

    return tokens;
}

// When the url is /users/{userId}/sigin-in we want the split to be ["users", "{userId}", "sign", "in"]
const NON_ALPHANUMERIC_EXCEPT_BRACES_REGEX = new RegExp("[^a-zA-Z0-9{}]+");
const BRACE_REGEX = new RegExp("[{}]", "g");

function maybeGetFastApiEndpointLocation({
    operationId,
    tag,
    path,
    method
}: {
    operationId: string;
    tag: string;
    path: string;
    method: HttpMethod;
}): EndpointLocation | undefined {
    const pathSegment = path.split(NON_ALPHANUMERIC_EXCEPT_BRACES_REGEX).join("_").replaceAll(BRACE_REGEX, "_");
    const operationIdSuffix = `${pathSegment}_${method.toLowerCase()}`;
    if (operationId.endsWith(operationIdSuffix)) {
        return {
            file: RelativeFilePath.of(camelCase(tag) + ".yml"),
            endpointId: camelCase(operationId.slice(0, -1 * operationIdSuffix.length)),
            tag
        };
    }
    return undefined;
}
