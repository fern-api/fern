import { mergeHeaders, mergeOnlyDefinedHeaders } from "../headers";
import type { LogConfig, Logger } from "../logging/logger";
import { join } from "../url/join";
import type { APIResponse } from "./APIResponse";
import type { Fetcher, FetchFunction } from "./Fetcher";
import { fetcherImpl } from "./Fetcher";
import { HttpResponsePromise } from "./HttpResponsePromise";
import type { RawResponse, WithRawResponse } from "./RawResponse";
import { Supplier } from "./Supplier";

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
        getAuthRequest(arg?: { endpointMetadata?: Record<string, unknown> }): Promise<{ headers: Record<string, string> }>;
    };
    headers?: Record<string, unknown>;
    timeoutInSeconds?: number;
    maxRetries?: number;
    fetch?: typeof fetch;
    logging?: LogConfig | Logger;
    /** Custom fetcher function. When provided, HttpClient.fetch() uses this instead of the default fetcherImpl. */
    fetcher?: FetchFunction;
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
export class HttpClient {
    private readonly _options: HttpClientOptions;
    private readonly _fetcherFn: FetchFunction;
    private readonly _createStatusCodeError: (
        args: { statusCode: number; body: unknown; rawResponse: RawResponse },
    ) => Error;
    private readonly _handleNonStatusCodeError: (
        error: Fetcher.Error,
        rawResponse: RawResponse,
        method: string,
        path: string,
    ) => never;

    constructor(
        options: HttpClientOptions,
        createStatusCodeError: (args: { statusCode: number; body: unknown; rawResponse: RawResponse }) => Error,
        handleNonStatusCodeError: (
            error: Fetcher.Error,
            rawResponse: RawResponse,
            method: string,
            path: string,
        ) => never,
    ) {
        this._options = options;
        this._fetcherFn = options.fetcher ?? fetcherImpl;
        this._createStatusCodeError = createStatusCodeError;
        this._handleNonStatusCodeError = handleNonStatusCodeError;
    }

    /** Expose normalized options for sub-clients that need them (e.g. pagination) */
    get options(): HttpClientOptions {
        return this._options;
    }

    /**
     * Low-level fetch that takes the same args as core.fetcher() and returns the raw APIResponse.
     * Used by complex endpoints (streaming, pagination, file upload, non-throwing) that need
     * to handle the response themselves. ALL HTTP calls should go through this method.
     *
     * Handles auth + global header merging on top of whatever endpoint-specific headers
     * are provided in args.headers. Pass requestHeaders for per-request header overrides.
     *
     * @param args - Fetcher args (url, method, headers, body, etc.)
     * @param options - Optional request-level overrides (per-request headers, endpoint metadata for auth)
     */
    public async fetch<R = unknown>(
        args: Fetcher.Args,
        options?: { requestHeaders?: Record<string, unknown>; endpointMetadata?: Record<string, unknown> }
    ): Promise<APIResponse<R, Fetcher.Error>> {
        // Merge headers: auth → global → endpoint-specific (args.headers) → per-request
        const authHeaders: Record<string, string> = this._options.authProvider
            ? (
                  await this._options.authProvider.getAuthRequest({
                      endpointMetadata: options?.endpointMetadata ?? args.endpointMetadata
                  })
              ).headers
            : {};
        const mergedHeaders = mergeHeaders(
            authHeaders,
            this._options.headers,
            args.headers,
            options?.requestHeaders
        );
        return this._fetcherFn<R>({ ...args, headers: mergedHeaders });
    }

    /**
     * Make an HTTP request. Returns HttpResponsePromise so callers get both
     * `await client.getUser()` and `client.getUser().withRawResponse()` for free.
     */
    public request<T>(config: EndpointConfig): HttpResponsePromise<T> {
        return HttpResponsePromise.fromPromise(this._execute<T>(config));
    }

    private async _execute<T>(config: EndpointConfig): Promise<WithRawResponse<T>> {
        // 1. Query params: endpoint-specific + per-request
        const queryParameters = config.queryParameters
            ? { ...config.queryParameters, ...config.requestOptions?.queryParams }
            : config.requestOptions?.queryParams;

        // 2. Build Fetcher.Args and delegate to fetch() for header merging
        const endpointHeaders = config.headers != null ? mergeOnlyDefinedHeaders(config.headers) : {};
        const response = await this.fetch<T>(
            {
                url: join(
                    (await Supplier.get(this._options.baseUrl)) ??
                        ((await Supplier.get(this._options.environment)) as string) ??
                        "",
                    config.path
                ),
                method: config.method,
                headers: endpointHeaders as Record<string, string>,
                contentType: config.contentType,
                requestType: config.requestType,
                responseType: config.responseType,
                queryParameters,
                body: config.body,
                duplex: config.duplex,
                timeoutMs: (config.requestOptions?.timeoutInSeconds ?? this._options.timeoutInSeconds ?? 60) * 1000,
                maxRetries: config.requestOptions?.maxRetries ?? this._options.maxRetries,
                abortSignal: config.requestOptions?.abortSignal,
                withCredentials: config.withCredentials,
                fetchFn: this._options.fetch,
                logging: this._options.logging,
                endpointMetadata: config.endpointMetadata
            },
            {
                requestHeaders: config.requestOptions?.headers,
                endpointMetadata: config.endpointMetadata
            }
        );

        // 3. Success
        if (response.ok) {
            const data = config.transformResponse
                ? (config.transformResponse(response.body) as T)
                : (response.body as T);
            return { data, rawResponse: response.rawResponse };
        }

        // 4. Status-code errors: check endpoint-specific map, then fall through to generic
        if (response.error.reason === "status-code") {
            const factory = config.errorMap?.[response.error.statusCode];
            if (factory) {
                throw factory(response.error.body, response.rawResponse);
            }
            throw this._createStatusCodeError({
                statusCode: response.error.statusCode,
                body: response.error.body,
                rawResponse: response.rawResponse
            });
        }

        // 5. Non-status-code errors (timeout, network, etc.)
        return this._handleNonStatusCodeError(response.error, response.rawResponse, config.method, config.path);
    }
}
