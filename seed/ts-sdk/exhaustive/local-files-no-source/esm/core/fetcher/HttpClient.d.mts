import type { LogConfig, Logger } from "../logging/logger.mjs";
import type { Fetcher } from "./Fetcher.mjs";
import { HttpResponsePromise } from "./HttpResponsePromise.mjs";
import type { RawResponse } from "./RawResponse.mjs";
import { Supplier } from "./Supplier.mjs";
/**
 * Configuration for a single endpoint request.
 * Each endpoint method provides only what's unique to that endpoint.
 */
export interface EndpointConfig {
    /** URL path relative to base (e.g. "/users", `/users/${id}`) */
    path: string;
    /** HTTP method */
    method: string;
    /** Request body. When set without explicit requestType, defaults to JSON. */
    body?: unknown;
    /** Query parameters specific to this endpoint (merged with requestOptions.queryParams) */
    queryParameters?: Record<string, unknown>;
    /** Endpoint-specific headers (e.g. custom headers from the API definition) */
    headers?: Record<string, unknown>;
    /** Override content type (default: "application/json" when body is present) */
    contentType?: string;
    /** Override request serialization (default: "json" when body is present) */
    requestType?: "json" | "file" | "bytes" | "form";
    /** Response type for streaming/SSE/other non-JSON responses */
    responseType?: "streaming" | "sse" | "blob" | "text" | "arrayBuffer" | "binary-response";
    /** Duplex mode for streaming uploads */
    duplex?: "half";
    /** Per-request overrides from the caller */
    requestOptions?: {
        timeoutInSeconds?: number;
        maxRetries?: number;
        abortSignal?: AbortSignal;
        headers?: Record<string, unknown>;
        queryParams?: Record<string, unknown>;
    };
    /** Map specific status codes to typed error constructors */
    errorMap?: Record<number, (body: unknown, rawResponse: RawResponse) => Error>;
    /** Whether to include credentials on cross-origin requests */
    withCredentials?: boolean;
    /** Endpoint metadata for supplier resolution */
    endpointMetadata?: Record<string, unknown>;
    /** Custom response transform (e.g. for deserialization). Called with the raw response body on success. */
    transformResponse?: (body: unknown) => unknown;
}
/**
 * Options for constructing an HttpClient.
 * These mirror the NormalizedClientOptions shape so the HttpClient can be
 * constructed with `this._options` directly from the generated client.
 */
export interface HttpClientOptions {
    baseUrl?: Supplier<string>;
    environment?: Supplier<unknown>;
    authProvider?: {
        getAuthRequest(arg?: {
            endpointMetadata?: Record<string, unknown>;
        }): Promise<{
            headers: Record<string, string>;
        }>;
    };
    headers?: Record<string, unknown>;
    timeoutInSeconds?: number;
    maxRetries?: number;
    fetch?: typeof fetch;
    logging?: LogConfig | Logger;
}
/**
 * A composable HTTP client that encapsulates all shared HTTP mechanics:
 * URL resolution, auth, header merging, timeout/retry, error handling.
 *
 * Created once at the top-level client and injected into all sub-clients.
 * Sub-clients become thin wrappers that only describe what's unique per endpoint.
 *
 * @param options - Normalized client options (baseUrl, auth, headers, etc.)
 * @param createStatusCodeError - Factory to create the SDK-specific generic error for status-code errors.
 * @param handleNonStatusCodeError - Handler for non-status-code errors (timeout, network, unknown, etc.)
 */
export declare class HttpClient {
    private readonly _options;
    private readonly _createStatusCodeError;
    private readonly _handleNonStatusCodeError;
    constructor(options: HttpClientOptions, createStatusCodeError: (args: {
        statusCode: number;
        body: unknown;
        rawResponse: RawResponse;
    }) => Error, handleNonStatusCodeError: (error: Fetcher.Error, rawResponse: RawResponse, method: string, path: string) => never);
    /** Expose normalized options for sub-clients that need them (e.g. pagination) */
    get options(): HttpClientOptions;
    /**
     * Make an HTTP request. Returns HttpResponsePromise so callers get both
     * `await client.getUser()` and `client.getUser().withRawResponse()` for free.
     */
    request<T>(config: EndpointConfig): HttpResponsePromise<T>;
    private _execute;
}
