import { camelCase } from "lodash-es";

import {
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    TypeDeclaration,
    TypeId,
    V2HttpEndpointExample,
    V2HttpEndpointResponse
} from "@fern-api/ir-sdk";

import { getRequestBodyExamples } from "./getRequestBodyExamples";
import { getResponseExamples } from "./getResponseExamples";

export declare namespace generateEndpointExample {
    interface Args {
        service: HttpService;
        endpoint: HttpEndpoint;
        typeDeclarations: Record<TypeId, TypeDeclaration>;
        skipOptionalRequestProperties: boolean;
    }

    interface Result {
        userFullExamples: Record<string, V2HttpEndpointExample>;
        autoFullExamples: Record<string, V2HttpEndpointExample>;
    }
}

export function generateEndpointExample({
    endpoint,
    service,
    typeDeclarations,
    skipOptionalRequestProperties
}: generateEndpointExample.Args): generateEndpointExample.Result {
    const userResults: Record<string, V2HttpEndpointExample> = {};
    const autoResults: Record<string, V2HttpEndpointExample> = {};
    const {
        userRequestExamples,
        autoRequestExamples,
        baseExample: baseRequestExample
    } = getRequestBodyExamples({
        endpoint,
        service,
        typeDeclarations,
        skipOptionalRequestProperties
    });
    const {
        userResponseExamples,
        autoResponseExamples,
        baseExample: baseResponseExample
    } = getResponseExamples({
        endpoint
    });

    const firstAutoRequestName = Object.keys(autoRequestExamples)[0];
    const firstAutoRequestExample = Object.values(autoRequestExamples)[0];
    const firstAutoResponseExample = Object.values(autoResponseExamples)[0];

    for (const [name, requestExample] of Object.entries(userRequestExamples)) {
        userResults[name] = {
            request: requestExample,
            response: userResponseExamples[name] ?? firstAutoResponseExample ?? baseResponseExample,
            codeSamples: undefined
        };
    }
    for (const [name, responseExample] of Object.entries(userResponseExamples)) {
        userResults[name] = {
            request: userRequestExamples[name] ?? firstAutoRequestExample ?? baseRequestExample,
            response: responseExample,
            codeSamples: undefined
        };
    }

    if (Object.keys(userResults).length === 0) {
        autoResults[firstAutoRequestName ?? camelCase(`${endpoint.name.originalName}_example`)] = {
            request: firstAutoRequestExample ?? baseRequestExample,
            response: firstAutoResponseExample ?? baseResponseExample,
            codeSamples: undefined
        };
    }

    return {
        userFullExamples: userResults,
        autoFullExamples: autoResults
    };
}
