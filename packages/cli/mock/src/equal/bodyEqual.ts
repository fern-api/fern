import { Request } from "express";
import { isEqual, isEqualWith } from "lodash-es";

import { ExampleEndpointCall } from "@fern-api/ir-sdk";

import { EqualResponse } from "./EqualRequestResponse";

export declare namespace bodyEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function bodyEqual({ request, example }: bodyEqual.Args): EqualResponse {
    if (example.request == null && Object.entries(request.body ?? {}).length === 0) {
        return { type: "equal" };
    }

    if (typeof example.request?.jsonExample === "object") {
        if (isEqualWith(JSON.stringify(request.body), JSON.stringify(example.request?.jsonExample ?? {}))) {
            return { type: "equal" };
        }

        for (const [key, value] of Object.entries(example.request?.jsonExample ?? {})) {
            const requestBodyParameter = request.body[key];
            if (!isEqual(requestBodyParameter, value)) {
                return {
                    type: "notEqual",
                    parameter: [key],
                    actualValue: requestBodyParameter,
                    expectedValue: value,
                    location: "body"
                };
            }
        }
        return { type: "equal" };
    }

    return isEqualWith(JSON.stringify(request.body), JSON.stringify(example.request?.jsonExample ?? {}))
        ? { type: "equal" }
        : {
              type: "notEqual",
              parameter: [],
              actualValue: request.body,
              expectedValue: example.request?.jsonExample,
              location: "body"
          };
}
