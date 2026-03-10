import { ExampleEndpointCall } from "@fern-api/ir-sdk";
import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { EqualResponse } from "./EqualRequestResponse.js";

export declare namespace headersEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function headersEqual({ request, example }: headersEqual.Args): EqualResponse {
    for (const exampleHeader of [...example.serviceHeaders, ...example.endpointHeaders]) {
        const wireValue = typeof exampleHeader.name === "string" ? exampleHeader.name : exampleHeader.name.wireValue;
        const requestHeader = request.headers[wireValue.toLowerCase()];
        if (
            !isEqualWith(
                requestHeader,
                typeof exampleHeader.value.jsonExample === "string"
                    ? exampleHeader.value.jsonExample
                    : JSON.stringify(exampleHeader.value.jsonExample)
            )
        ) {
            return {
                type: "notEqual",
                parameter: [wireValue],
                actualValue: requestHeader,
                expectedValue: exampleHeader.value.jsonExample,
                location: "header"
            };
        }
    }
    return { type: "equal" };
}
