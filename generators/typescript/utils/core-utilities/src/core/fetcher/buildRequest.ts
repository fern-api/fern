import { createRequestUrl } from "./createRequestUrl";
import type { EndpointMetadata } from "./EndpointMetadata";
import { EndpointSupplier } from "./EndpointSupplier";
import { getFetchFn } from "./getFetchFn";
import { getRequestBody } from "./getRequestBody";

export declare namespace BuildRequest {
    export interface Args {
        url: string;
        method: string;
        contentType?: string;
        headers?: Record<string, unknown>;
        queryParameters?: Record<string, unknown>;
        body?: unknown;
        requestType?: "json" | "file" | "bytes" | "form" | "other";
        endpointMetadata?: EndpointMetadata;
    }
}

/**
 * Build a standard Fetch `Request` object from SDK endpoint arguments.
 * Auth, base URL, headers, query parameters, and serialized body are all baked in.
 * Does NOT send the request or apply retry/timeout logic — the caller owns sending.
 */
export async function buildRequest(args: BuildRequest.Args): Promise<Request> {
    const url = createRequestUrl(args.url, args.queryParameters);

    const headers = new Headers();
    if (args.body !== undefined && args.contentType != null) {
        headers.set("Content-Type", args.contentType);
    }

    if (args.headers != null) {
        for (const [key, value] of Object.entries(args.headers)) {
            const result = await EndpointSupplier.get(value, { endpointMetadata: args.endpointMetadata ?? {} });
            if (typeof result === "string") {
                headers.set(key, result);
                continue;
            }
            if (result == null) {
                continue;
            }
            headers.set(key, `${result}`);
        }
    }

    const requestBody: BodyInit | undefined = await getRequestBody({
        body: args.body,
        type: args.requestType ?? "other",
    });

    return new Request(url, {
        method: args.method,
        headers,
        body: requestBody,
    });
}
