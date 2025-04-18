import {
    HttpEndpoint,
    HttpService,
    IntermediateRepresentation,
    TypeDeclaration,
    TypeId,
    V2HttpEndpointExample
} from "@fern-api/ir-sdk";

import { generateRequestBodyExample } from "./generateRequestBodyExample";
import { generateResponseExample } from "./generateResponseExample";

export declare namespace generateEndpointExample {
    interface Args {
        ir: Omit<IntermediateRepresentation, "sdkConfig" | "subpackages" | "rootPackage">;
        service: HttpService;
        endpoint: HttpEndpoint;
        typeDeclarations: Record<TypeId, TypeDeclaration>;
        skipOptionalRequestProperties: boolean;
    }

    interface Result {
        name: string;
        example: V2HttpEndpointExample;
    }
}

export function generateEndpointExample({
    ir,
    endpoint,
    service,
    typeDeclarations,
    skipOptionalRequestProperties
}: generateEndpointExample.Args): generateEndpointExample.Result {
    const result: V2HttpEndpointExample = {
        request: undefined,
        response: undefined,
        codeSamples: undefined
    };

    result.request = generateRequestBodyExample({
        endpoint,
        service,
        typeDeclarations,
        skipOptionalRequestProperties
    });

    result.response = generateResponseExample({
        endpoint,
        typeDeclarations,
        skipOptionalRequestProperties
    });

    return {
        name: `${endpoint.name.originalName}_example`,
        example: result
    };
}
