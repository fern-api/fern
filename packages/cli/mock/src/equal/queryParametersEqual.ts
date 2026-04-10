import { ExampleEndpointCall } from "@fern-api/ir-sdk";
import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { EqualResponse } from "./EqualRequestResponse.js";

export declare namespace queryParametersEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function queryParametersEqual({ request, example }: queryParametersEqual.Args): EqualResponse {
    for (const exampleQueryParameter of [...example.queryParameters]) {
        const wireValue =
            typeof exampleQueryParameter.name === "string"
                ? exampleQueryParameter.name
                : exampleQueryParameter.name.wireValue;
        const requestQueryParameter = request.query[wireValue];
        if (
            !isEqualWith(
                requestQueryParameter,
                typeof exampleQueryParameter.value.jsonExample === "string"
                    ? exampleQueryParameter.value.jsonExample
                    : JSON.stringify(exampleQueryParameter.value.jsonExample)
            )
        ) {
            return {
                type: "notEqual",
                parameter: [wireValue],
                actualValue: requestQueryParameter,
                expectedValue: exampleQueryParameter.value.jsonExample,
                location: "query"
            };
        }
    }
    return { type: "equal" };
}
