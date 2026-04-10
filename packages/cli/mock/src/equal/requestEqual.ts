import { ExampleEndpointCall } from "@fern-api/ir-sdk";
import { Request } from "express";
import { bodyEqual } from "./bodyEqual.js";
import { EqualResponse } from "./EqualRequestResponse.js";
import { headersEqual } from "./headersEqual.js";
import { pathParametersEqual } from "./pathParametersEqual.js";
import { queryParametersEqual } from "./queryParametersEqual.js";

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
