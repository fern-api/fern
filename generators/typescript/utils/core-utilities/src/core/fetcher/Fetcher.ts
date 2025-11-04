import { toJson } from "../json";
import { createLogger, type Logger } from "../logging/logger";
import type { APIResponse } from "./APIResponse";
import { createRequestUrl } from "./createRequestUrl";
import type { EndpointMetadata } from "./EndpointMetadata";
import { EndpointSupplier } from "./EndpointSupplier";
import { getErrorResponseBody } from "./getErrorResponseBody";
import { getFetchFn } from "./getFetchFn";
import { getRequestBody } from "./getRequestBody";
import { getResponseBody } from "./getResponseBody";
import { makeRequest } from "./makeRequest";
import { abortRawResponse, toRawResponse, unknownRawResponse } from "./RawResponse";
import { requestWithRetries } from "./requestWithRetries";

export type FetchFunction = <R = unknown>(args: Fetcher.Args) => Promise<APIResponse<R, Fetcher.Error>>;

export declare namespace Fetcher {
    export interface Args {
        url: string;
        method: string;
        contentType?: string;
        headers?: Record<string, string | EndpointSupplier<string | null | undefined> | null | undefined>;
        queryParameters?: Record<string, unknown>;
        body?: unknown;
        timeoutMs?: number;
        maxRetries?: number;
        withCredentials?: boolean;
        abortSignal?: AbortSignal;
        requestType?: "json" | "file" | "bytes" | "form" | "other";
        responseType?: "json" | "blob" | "sse" | "streaming" | "text" | "arrayBuffer" | "binary-response";
        duplex?: "half";
        endpointMetadata?: EndpointMetadata;
        fetchFn?: typeof fetch;
        logger?: Logger;
    }

    export type Error = FailedStatusCodeError | NonJsonError | TimeoutError | UnknownError;

    export interface FailedStatusCodeError {
        reason: "status-code";
        statusCode: number;
        body: unknown;
    }

    export interface NonJsonError {
        reason: "non-json";
        statusCode: number;
        rawBody: string;
    }

    export interface TimeoutError {
        reason: "timeout";
    }

    export interface UnknownError {
        reason: "unknown";
        errorMessage: string;
    }
}

const SENSITIVE_HEADERS = new Set([
    "authorization",
    "x-api-key",
    "api-key",
    "x-auth-token",
    "cookie",
    "set-cookie",
    "proxy-authorization",
    "x-csrf-token",
    "x-xsrf-token"
]);

function filterSensitiveHeaders(headers: Record<string, string>): Record<string, string> {
    const filtered: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
            filtered[key] = "[REDACTED]";
        } else {
            filtered[key] = value;
        }
    }
    return filtered;
}

async function getHeaders(args: Fetcher.Args): Promise<Record<string, string>> {
    const newHeaders: Record<string, string> = {};
    if (args.body !== undefined && args.contentType != null) {
        newHeaders["Content-Type"] = args.contentType;
    }

    if (args.headers == null) {
        return newHeaders;
    }

    for (const [key, value] of Object.entries(args.headers)) {
        const result = await EndpointSupplier.get(value, { endpointMetadata: args.endpointMetadata ?? {} });
        if (typeof result === "string") {
            newHeaders[key] = result;
            continue;
        }
        if (result == null) {
            continue;
        }
        newHeaders[key] = `${result}`;
    }
    return newHeaders;
}

export async function fetcherImpl<R = unknown>(args: Fetcher.Args): Promise<APIResponse<R, Fetcher.Error>> {
    const url = createRequestUrl(args.url, args.queryParameters);
    const requestBody: BodyInit | undefined = await getRequestBody({
        body: args.body,
        type: args.requestType ?? "other"
    });
    const fetchFn = args.fetchFn ?? (await getFetchFn());
    const headers = await getHeaders(args);
    const logger = createLogger(args.logger);

    if (logger.isDebug()) {
        const metadata = {
            method: args.method,
            url,
            headers: filterSensitiveHeaders(headers),
            queryParameters: args.queryParameters,
            hasBody: requestBody != null
        };
        logger.debug("Making HTTP request", metadata);
    }

    try {
        const response = await requestWithRetries(
            async () =>
                makeRequest(
                    fetchFn,
                    url,
                    args.method,
                    headers,
                    requestBody,
                    args.timeoutMs,
                    args.abortSignal,
                    args.withCredentials,
                    args.duplex
                ),
            args.maxRetries
        );

        if (response.status >= 200 && response.status < 400) {
            if (logger.isDebug()) {
                const metadata = {
                    method: args.method,
                    url,
                    statusCode: response.status
                };
                logger.debug("HTTP request succeeded", metadata);
            }
            return {
                ok: true,
                body: (await getResponseBody(response, args.responseType)) as R,
                headers: response.headers,
                rawResponse: toRawResponse(response)
            };
        } else {
            if (logger.isError()) {
                const metadata = {
                    method: args.method,
                    url,
                    statusCode: response.status
                };
                logger.error("HTTP request failed with error status", metadata);
            }
            return {
                ok: false,
                error: {
                    reason: "status-code",
                    statusCode: response.status,
                    body: await getErrorResponseBody(response)
                },
                rawResponse: toRawResponse(response)
            };
        }
    } catch (error) {
        if (args.abortSignal != null && args.abortSignal.aborted) {
            if (logger.isError()) {
                const metadata = {
                    method: args.method,
                    url
                };
                logger.error("HTTP request was aborted", metadata);
            }
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: "The user aborted a request"
                },
                rawResponse: abortRawResponse
            };
        } else if (error instanceof Error && error.name === "AbortError") {
            if (logger.isError()) {
                const metadata = {
                    method: args.method,
                    url,
                    timeoutMs: args.timeoutMs
                };
                logger.error("HTTP request timed out", metadata);
            }
            return {
                ok: false,
                error: {
                    reason: "timeout"
                },
                rawResponse: abortRawResponse
            };
        } else if (error instanceof Error) {
            if (logger.isError()) {
                const metadata = {
                    method: args.method,
                    url,
                    errorMessage: error.message
                };
                logger.error("HTTP request failed with error", metadata);
            }
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: error.message
                },
                rawResponse: unknownRawResponse
            };
        }

        if (logger.isError()) {
            const metadata = {
                method: args.method,
                url,
                error: toJson(error)
            };
            logger.error("HTTP request failed with unknown error", metadata);
        }
        return {
            ok: false,
            error: {
                reason: "unknown",
                errorMessage: toJson(error)
            },
            rawResponse: unknownRawResponse
        };
    }
}

export const fetcher: FetchFunction = fetcherImpl;
