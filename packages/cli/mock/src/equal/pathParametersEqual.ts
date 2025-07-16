import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { ExampleEndpointCall } from "@fern-api/ir-sdk";

import { EqualResponse } from "./EqualRequestResponse";

export declare namespace pathParametersEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function pathParametersEqual({ request, example }: pathParametersEqual.Args): EqualResponse {
    for (const examplePathParameter of [
        ...example.rootPathParameters,
        ...example.servicePathParameters,
        ...example.endpointPathParameters
    ]) {
        const requestPathParameter = request.params[examplePathParameter.name.originalName];
        if (
            !isEqualWith(
                requestPathParameter,
                typeof examplePathParameter.value.jsonExample === "string"
                    ? examplePathParameter.value.jsonExample
                    : JSON.stringify(examplePathParameter.value.jsonExample)
            )
        ) {
            return {
                type: "notEqual",
                parameter: [examplePathParameter.name.originalName],
                actualValue: requestPathParameter,
                expectedValue: examplePathParameter.value.jsonExample,
                location: "path"
            };
        }
    }
    return { type: "equal" };
}
