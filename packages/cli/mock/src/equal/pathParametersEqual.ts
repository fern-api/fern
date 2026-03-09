import { ExampleEndpointCall, NameOrString } from "@fern-api/ir-sdk";
import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { EqualResponse } from "./EqualRequestResponse.js";

function getNameString(name: NameOrString): string {
    return typeof name === "string" ? name : name.originalName;
}

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
        const paramName = getNameString(examplePathParameter.name);
        const requestPathParameter = request.params[paramName];
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
                parameter: [paramName],
                actualValue: requestPathParameter,
                expectedValue: examplePathParameter.value.jsonExample,
                location: "path"
            };
        }
    }
    return { type: "equal" };
}
