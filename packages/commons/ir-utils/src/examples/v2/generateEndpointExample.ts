import { Examples } from "@fern-api/core-utils";
import {
    HttpEndpoint,
    IntermediateRepresentation,
    V2HttpEndpointExample,
    V2HttpEndpointRequest,
    V2HttpEndpointResponse
} from "@fern-api/ir-sdk";
import { camelCase } from "lodash-es";

import { getRequestBodyExamples } from "./getRequestBodyExamples";
import { getResponseExamples } from "./getResponseExamples";

export declare namespace generateEndpointExample {
    interface Args {
        endpoint: HttpEndpoint;
        ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
        skipOptionalRequestProperties: boolean;
    }

    interface Result {
        userFullExamples: Record<string, V2HttpEndpointExample>;
        autoFullExamples: Record<string, V2HttpEndpointExample>;
    }
}

const createExampleKey = (requestKey: string, responseKey: string, statusCode: number | undefined): string => {
    let key: string;
    if (requestKey === responseKey) {
        key = `${requestKey}`;
    } else {
        key = `${requestKey}_${responseKey}`;
    }
    if (statusCode) {
        key = `${key}_${statusCode}`;
    }
    return key;
};

function hasDefaultValues(obj: unknown): boolean {
    if (typeof obj !== "object" || obj === null) {
        // Check if primitive value matches any default examples
        const isDefaultPrimitive =
            obj === Examples.STRING ||
            obj === Examples.BOOLEAN ||
            obj === Examples.DATE ||
            obj === Examples.DATE_TIME ||
            obj === Examples.DOUBLE ||
            obj === Examples.FLOAT ||
            obj === Examples.INT ||
            obj === Examples.INT64 ||
            obj === Examples.UINT ||
            obj === Examples.UINT64 ||
            obj === Examples.UUID ||
            obj === Examples.BASE64 ||
            obj === Examples.BIG_INTEGER;

        // Also check if it's one of the sample strings
        const isDefaultString = typeof obj === "string" && Examples.SAMPLE_STRINGS.includes(obj);

        return isDefaultPrimitive || isDefaultString;
    }

    // For objects, recursively check all values
    if (Array.isArray(obj)) {
        return obj.some(hasDefaultValues);
    }

    const record = obj as Record<string, unknown>;
    return Object.values(record).some(hasDefaultValues);
}

const addExampleToStore = ({
    exampleStore,
    key,
    example
}: {
    exampleStore: Map<string, V2HttpEndpointExample>;
    key: string;
    example: V2HttpEndpointExample;
}): boolean => {
    // const key = createExampleKey(requestKey, responseKey, statusCode);
    if (!exampleStore.has(key)) {
        exampleStore.set(key, example);
        return true;
    }
    return false;
};

function maybeCreateAndStoreExample({
    key,
    displayName,
    request,
    response,
    exampleStore,
    userOrAutoStore,
    isUserSpecified = false
}: {
    key: string;
    displayName: string;
    request: V2HttpEndpointRequest;
    response: V2HttpEndpointResponse;
    exampleStore: Map<string, V2HttpEndpointExample>;
    userOrAutoStore: Record<string, V2HttpEndpointExample>;
    isUserSpecified?: boolean;
}): boolean {
    if (!exampleStore.has(key)) {
        // Analyze the actual example content to determine metadata
        const requestHasDefaults =
            hasDefaultValues(request.requestBody) ||
            hasDefaultValues(request.pathParameters) ||
            hasDefaultValues(request.queryParameters) ||
            hasDefaultValues(request.headers);
        const responseHasDefaults = hasDefaultValues(response.body);
        const exampleHasDefaults = requestHasDefaults || responseHasDefaults;

        const example: V2HttpEndpointExample = {
            displayName,
            request,
            response,
            codeSamples: undefined,
            examplePropertyMetadata:
                isUserSpecified || !exampleHasDefaults
                    ? {
                          hasDefaultProperties: false,
                          hasCustomProperties: true
                      }
                    : {
                          hasDefaultProperties: true,
                          hasCustomProperties: false
                      }
        };

        userOrAutoStore[key] = example;

        addExampleToStore({
            exampleStore,
            key,
            example
        });

        return true;
    }

    return false;
}

export function generateEndpointExample({
    endpoint,
    ir,
    skipOptionalRequestProperties
}: generateEndpointExample.Args): generateEndpointExample.Result {
    const userResults: Record<string, V2HttpEndpointExample> = {};
    const autoResults: Record<string, V2HttpEndpointExample> = {};
    const exampleStore: Map<string, V2HttpEndpointExample> = new Map();

    const {
        userRequestExamples,
        autoRequestExamples,
        baseExample: baseRequestExample
    } = getRequestBodyExamples({
        endpoint,
        ir,
        skipOptionalRequestProperties
    });

    const firstUserRequestName = Object.keys(userRequestExamples)[0];
    const firstUserRequestExample = Object.values(userRequestExamples)[0];

    const firstAutoRequestName = Object.keys(autoRequestExamples)[0];
    const firstAutoRequestExample = Object.values(autoRequestExamples)[0];

    // Create examples for each status code on each response
    const requestExamplesUsed = createExamplesForResponseStatusCodes({
        endpoint,
        userRequestExamples,
        baseRequestExample,
        firstUserRequestName,
        firstUserRequestExample,
        firstAutoRequestName,
        firstAutoRequestExample,
        userResults,
        autoResults,
        exampleStore
    });

    // Create examples for remaining user-specified requests
    createExamplesForRemainingUserRequests({
        endpoint,
        userRequestExamples,
        requestExamplesUsed,
        userResults,
        exampleStore
    });

    // This means there were no user-specified requests, and there are no non-null responses
    if (Object.keys(userResults).length === 0 && Object.keys(autoResults).length === 0) {
        const { baseExample: baseResponseExample } = getResponseExamples({
            endpoint
        });

        const key = createExampleKey(firstAutoRequestName ?? "base", "base", undefined);
        maybeCreateAndStoreExample({
            key,
            displayName: firstAutoRequestName ?? "base",
            request: firstAutoRequestExample ?? baseRequestExample,
            response: baseResponseExample,
            exampleStore,
            userOrAutoStore: autoResults
        });
    }

    return {
        userFullExamples: userResults,
        autoFullExamples: autoResults
    };
}

function createExamplesForResponseStatusCodes({
    endpoint,
    userRequestExamples,
    baseRequestExample,
    firstUserRequestName,
    firstUserRequestExample,
    firstAutoRequestName,
    firstAutoRequestExample,
    userResults,
    autoResults,
    exampleStore
}: {
    endpoint: HttpEndpoint;
    userRequestExamples: Record<string, V2HttpEndpointRequest>;
    baseRequestExample: V2HttpEndpointRequest;
    firstUserRequestName: string | undefined;
    firstUserRequestExample: V2HttpEndpointRequest | undefined;
    firstAutoRequestName: string | undefined;
    firstAutoRequestExample: V2HttpEndpointRequest | undefined;
    userResults: Record<string, V2HttpEndpointExample>;
    autoResults: Record<string, V2HttpEndpointExample>;
    exampleStore: Map<string, V2HttpEndpointExample>;
}): Set<string> {
    const endpointResponseArray = endpoint.v2Responses?.responses ?? [endpoint.response];
    const requestExamplesUsed: Set<string> = new Set();

    for (const response of endpointResponseArray) {
        let examplesCreatedForResponse = false;

        const {
            userResponseExamples,
            autoResponseExamples,
            baseExample: baseResponseExample
        } = getResponseExamples({
            endpoint,
            responseObject: response
        });

        const firstAutoResponseName = Object.keys(autoResponseExamples)[0];
        const firstAutoResponseExample = Object.values(autoResponseExamples)[0];

        // Create response example from user-specified example
        for (const [name, responseExample] of Object.entries(userResponseExamples)) {
            let key: string;
            let requestExampleToUse: V2HttpEndpointRequest;
            if (userRequestExamples[name]) {
                requestExampleToUse = userRequestExamples[name];
                requestExamplesUsed.add(name);
                key = createExampleKey(name, name, response?.statusCode);
            } else if (firstAutoRequestExample && firstAutoRequestName) {
                requestExampleToUse = firstAutoRequestExample;
                key = createExampleKey(firstAutoRequestName, name, response?.statusCode);
            } else {
                requestExampleToUse = baseRequestExample;
                key = createExampleKey("base", name, response?.statusCode);
            }

            if (
                maybeCreateAndStoreExample({
                    key,
                    displayName: name,
                    request: requestExampleToUse,
                    response: responseExample,
                    exampleStore,
                    userOrAutoStore: userResults,
                    isUserSpecified: true
                })
            ) {
                examplesCreatedForResponse = true;
            }
        }

        // Create response example from auto-generated example if no user-specified examples were created
        if (!examplesCreatedForResponse) {
            const fallbackExampleDisplayName = camelCase(`${endpoint.name.originalName}_example`);
            if (firstUserRequestName && firstUserRequestExample) {
                requestExamplesUsed.add(firstUserRequestName);
            }
            let key = createExampleKey(
                firstUserRequestName ?? firstAutoRequestName ?? "base",
                firstAutoResponseName ?? "base",
                response?.statusCode
            );
            if (
                maybeCreateAndStoreExample({
                    key,
                    displayName: firstUserRequestName ?? firstAutoRequestName ?? fallbackExampleDisplayName,
                    request: firstUserRequestExample ?? firstAutoRequestExample ?? baseRequestExample,
                    response: firstAutoResponseExample ?? baseResponseExample,
                    exampleStore,
                    userOrAutoStore: autoResults
                })
            ) {
                examplesCreatedForResponse = true;
            }
        }
    }

    return requestExamplesUsed;
}

function createExamplesForRemainingUserRequests({
    endpoint,
    userRequestExamples,
    requestExamplesUsed,
    userResults,
    exampleStore
}: {
    endpoint: HttpEndpoint;
    userRequestExamples: Record<string, V2HttpEndpointRequest>;
    requestExamplesUsed: Set<string>;
    userResults: Record<string, V2HttpEndpointExample>;
    exampleStore: Map<string, V2HttpEndpointExample>;
}): void {
    const {
        userResponseExamples,
        autoResponseExamples,
        baseExample: baseResponseExample
    } = getResponseExamples({
        endpoint
    });

    const firstUserResponseExample = Object.values(userResponseExamples)[0];
    const firstUserResponseName = Object.keys(userResponseExamples)[0];

    const firstAutoResponseName = Object.keys(autoResponseExamples)[0];
    const firstAutoResponseExample = Object.values(autoResponseExamples)[0];

    const remainingUserRequestExamples = Object.entries(userRequestExamples).filter(
        ([name]) => !requestExamplesUsed.has(name)
    );

    for (const [name, requestExample] of remainingUserRequestExamples) {
        const key = createExampleKey(
            name,
            firstUserResponseName ?? firstAutoResponseName ?? "base",
            firstUserResponseExample
                ? firstUserResponseExample.statusCode
                : firstAutoResponseExample
                  ? firstAutoResponseExample.statusCode
                  : baseResponseExample.statusCode
        );
        maybeCreateAndStoreExample({
            key,
            displayName: name,
            request: requestExample,
            response: firstUserResponseExample ?? firstAutoResponseExample ?? baseResponseExample,
            exampleStore,
            userOrAutoStore: userResults,
            isUserSpecified: true
        });
    }
}
