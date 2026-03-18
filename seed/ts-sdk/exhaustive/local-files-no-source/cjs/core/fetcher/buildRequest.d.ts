import type { EndpointMetadata } from "./EndpointMetadata.js";
export declare namespace BuildRequest {
    interface Args {
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
export declare function buildRequest(args: BuildRequest.Args): Promise<Request>;
