import { ExampleEndpointCall } from "@fern-api/ir-sdk";
import { Request } from "express";
import { isEqualWith } from "lodash-es";

import { EqualResponse } from "./EqualRequestResponse";
import { getOriginalName } from "@fern-api/ir-utils";

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
        const requestPathParameter = request.params[getOriginalName(examplePathParameter.name)];
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
                parameter: [getOriginalName(examplePathParameter.name)],
                actualValue: requestPathParameter,
                expectedValue: examplePathParameter.value.jsonExample,
                location: "path"
            };
        }
    }
    return { type: "equal" };
}
