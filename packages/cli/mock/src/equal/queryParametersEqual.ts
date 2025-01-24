import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { ExampleEndpointCall } from "@fern-api/ir-sdk";

import { EqualResponse } from "./EqualRequestResponse";

export declare namespace queryParametersEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function queryParametersEqual({ request, example }: queryParametersEqual.Args): EqualResponse {
    for (const exampleQueryParameter of [...example.queryParameters]) {
        const requestQueryParameter = request.query[exampleQueryParameter.name.wireValue];
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
                parameter: [exampleQueryParameter.name.wireValue],
                actualValue: requestQueryParameter,
                expectedValue: exampleQueryParameter.value.jsonExample,
                location: "query"
            };
        }
    }
    return { type: "equal" };
}
