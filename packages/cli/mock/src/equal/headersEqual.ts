import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { ExampleEndpointCall } from "@fern-api/ir-sdk";

import { EqualResponse } from "./EqualRequestResponse";

export declare namespace headersEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function headersEqual({ request, example }: headersEqual.Args): EqualResponse {
    for (const exampleHeader of [...example.serviceHeaders, ...example.endpointHeaders]) {
        const requestHeader = request.headers[exampleHeader.name.wireValue.toLowerCase()];
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
                parameter: [exampleHeader.name.wireValue],
                actualValue: requestHeader,
                expectedValue: exampleHeader.value.jsonExample,
                location: "header"
            };
        }
    }
    return { type: "equal" };
}
