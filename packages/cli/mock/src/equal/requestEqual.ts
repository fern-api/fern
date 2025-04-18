import { Request } from "express";

import { ExampleEndpointCall } from "@fern-api/ir-sdk";

import { EqualResponse } from "./EqualRequestResponse";
import { bodyEqual } from "./bodyEqual";
import { headersEqual } from "./headersEqual";
import { pathParametersEqual } from "./pathParametersEqual";
import { queryParametersEqual } from "./queryParametersEqual";

export declare namespace requestEqual {
    interface Args {
        request: Request;
        example: ExampleEndpointCall;
    }
}

export function requestEqual({ request, example }: requestEqual.Args): EqualResponse {
    const pathParameterResponse = pathParametersEqual({
        request,
        example
    });
    if (pathParameterResponse.type === "notEqual") {
        return pathParameterResponse;
    }

    const queryParametersResponse = queryParametersEqual({
        request,
        example
    });
    if (queryParametersResponse.type === "notEqual") {
        return queryParametersResponse;
    }

    const headersResponse = headersEqual({
        request,
        example
    });
    if (headersResponse.type === "notEqual") {
        return headersResponse;
    }

    const bodyResponse = bodyEqual({
        request,
        example
    });
    if (bodyResponse.type === "notEqual") {
        return bodyResponse;
    }

    return { type: "equal" };
}
