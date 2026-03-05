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
 * Per-request options that callers pass to individual endpoint methods.
 *
 * Generated `BaseRequestOptions` extends this with SDK-specific headers
 * (e.g. per-header overrides, version headers, idempotency keys).
 */
export interface RequestOptions {
    /** The maximum time to wait for a response in seconds. */
    timeoutInSeconds?: number;
    /** The number of times to retry the request. Defaults to 2. */
    maxRetries?: number;
    /** A hook to abort the request. */
    abortSignal?: AbortSignal;
    /** Additional headers to include in the request. */
    headers?: Record<string, string | Supplier<string | null | undefined> | null | undefined>;
    /** Additional query string parameters to include in the request. */
    queryParams?: Record<string, unknown>;
}

/**
 * Configuration for a single endpoint request.
 * Each endpoint method provides only what's unique to that endpoint.
 */
export interface EndpointConfig {
    /** URL path relative to base (e.g. "/users", `/users/${id}`) */
    path: string;
    /** HTTP method */
    method: string;
    /** Request body */
    body?: unknown;
    /** Query parameters specific to this endpoint (merged with requestOptions.queryParams) */
    queryParameters?: Record<string, unknown>;
    /** Endpoint-specific headers (e.g. custom headers from the API definition) */
    headers?: Record<string, unknown>;
    /** Override content type */
    contentType?: string;
    /** Request serialization type */
    requestType?: Fetcher.Args["requestType"];
    /** Response type for non-JSON responses */
    responseType?: Fetcher.Args["responseType"];
    /** Duplex mode for streaming uploads */
    duplex?: "half";
    /** Per-request overrides from the caller */
    requestOptions?: RequestOptions;
    /**
     * Custom error handler for status-code errors. Called with the status code, body, and raw response.
     * Must always return an Error to throw — either a typed endpoint-specific error or the generic SDK error.
     */
    errorHandler?: (statusCode: number, body: unknown, rawResponse: RawResponse) => Error;
    /** Whether to include credentials on cross-origin requests */
    withCredentials?: boolean;
    /** Endpoint metadata for auth provider routing */
    endpointMetadata?: Record<string, unknown>;
    /** Custom response transform (e.g. for deserialization or HEAD responses) */
    transformResponse?: (body: unknown, rawResponse: RawResponse) => unknown;
    /**
     * Override the default timeout for this endpoint (in seconds).
     * Falls back to requestOptions.timeoutInSeconds, then client-level timeout, then this value.
     * Use "infinity" to disable timeout.
     */
    defaultTimeoutInSeconds?: number | "infinity";
    /**
     * Override the base URL for this endpoint. Used by multi-URL environments
     * where different endpoints hit different base URLs.
     */
    baseUrl?: string;
}

/**
 * Shared options for creating a RequestFn.
 *
 * Structurally compatible with the generated `NormalizedClientOptions` —
 * the generated client passes its normalized options directly to `createRequestFn`.
 */
export interface HttpClientOptions {
    baseUrl?: Supplier<string>;
    environment?: Supplier<unknown>;
    authProvider?: {
        getAuthRequest(arg?: {
            endpointMetadata?: Record<string, unknown>;
        }): Promise<{ headers: Record<string, string> }>;
    };
    headers?: Record<string, unknown>;
    timeoutInSeconds?: number;
    maxRetries?: number;
    fetch?: typeof fetch;
    logging?: LogConfig | Logger;
    /** Custom fetcher function. When provided, HttpClient uses this instead of the default fetcherImpl. */
    fetcher?: FetchFunction;
    /** Default base URL from the SDK's default environment. Fallback when neither baseUrl nor environment is provided. */
    defaultBaseUrl?: string;
}

/**
 * A callable request function that encapsulates all shared HTTP mechanics:
 * URL resolution, auth, header merging, timeout/retry, error handling.
 *
 * Created once at the top-level client via `createRequestFn` and injected into all sub-clients.
 * Sub-clients become thin wrappers that only describe what's unique per endpoint.
 *
 * The primary interface is the call signature: `requestFn<T>(config)` returns `HttpResponsePromise<T>`.
 * The `.fetch()` method provides low-level access for endpoints that need the raw `APIResponse`
 * (e.g. non-throwing mode, custom pagination).
 */
export interface RequestFn {
    /** Make an HTTP request. Returns HttpResponsePromise for both `await` and `.withRawResponse()` usage. */
    <T>(config: EndpointConfig | (() => Promise<EndpointConfig>)): HttpResponsePromise<T>;
    /** Low-level fetch returning the raw APIResponse. Used by non-throwing and custom pagination endpoints. */
    fetch<R = unknown>(
        args: Fetcher.Args,
        options?: { requestHeaders?: Record<string, unknown>; endpointMetadata?: Record<string, unknown> },
    ): Promise<APIResponse<R, Fetcher.Error>>;
}

/**
 * Options for creating a RequestFn via `createRequestFn`.
 * Extends HttpClientOptions with the SDK-specific error factories.
 */
export interface CreateRequestFnOptions extends HttpClientOptions {
    /** Factory to create the SDK-specific generic error for status-code errors. */
    createStatusCodeError: (args: { statusCode: number; body: unknown; rawResponse: RawResponse }) => Error;
    /** Handler for non-status-code errors (timeout, network, unknown, etc.) */
    handleNonStatusCodeError: (error: Fetcher.Error, rawResponse: RawResponse, method: string, path: string) => never;
}

/**
 * Creates a RequestFn that closes over the provided options.
 * The returned function is the primary API for making HTTP requests in generated SDKs.
 *
 * All shared HTTP mechanics (URL resolution, auth, header merging, timeout/retry,
 * error handling) are encapsulated in closures — no class needed.
 *
 * @example
 * ```typescript
 * const requestFn = createRequestFn({ ...normalizedOptions, createStatusCodeError, handleNonStatusCodeError });
 * // Use as a function:
 * requestFn<User>({ method: "GET", path: "/users/123", requestOptions });
 * // Low-level fetch:
 * requestFn.fetch<User>({ url: "...", method: "GET", headers: {} });
 * ```
 */
export function createRequestFn(options: CreateRequestFnOptions): RequestFn {
    const fetchFn: FetchFunction = options.fetcher ?? fetcherImpl;

    /**
     * Low-level fetch returning the raw APIResponse.
     * Handles auth + global header merging on top of endpoint-specific headers.
     */
    async function fetchWithHeaders<R = unknown>(
        args: Fetcher.Args,
        fetchOptions?: { requestHeaders?: Record<string, unknown>; endpointMetadata?: Record<string, unknown> },
    ): Promise<APIResponse<R, Fetcher.Error>> {
        const authHeaders: Record<string, string> = options.authProvider
            ? (
                  await options.authProvider.getAuthRequest({
                      endpointMetadata: fetchOptions?.endpointMetadata ?? args.endpointMetadata,
                  })
              ).headers
            : {};
        const mergedHeaders = mergeHeaders(authHeaders, options.headers, args.headers, fetchOptions?.requestHeaders);
        return fetchFn<R>({ ...args, headers: mergedHeaders });
    }

    /**
     * Resolves the timeout in milliseconds for a request.
     * Priority: requestOptions.timeoutInSeconds > client-level > endpoint default > 60s.
     * "infinity" means no timeout (returns undefined).
     */
    function resolveTimeoutMs(config: EndpointConfig): number | undefined {
        const requestTimeout = config.requestOptions?.timeoutInSeconds;
        if (requestTimeout != null) {
            return requestTimeout * 1000;
        }
        const clientTimeout = options.timeoutInSeconds;
        if (clientTimeout != null) {
            return clientTimeout * 1000;
        }
        const endpointDefault = config.defaultTimeoutInSeconds;
        if (endpointDefault === "infinity") {
            return undefined;
        }
        if (endpointDefault != null) {
            return endpointDefault * 1000;
        }
        return 60 * 1000;
    }

    /** Execute a single endpoint request and handle the response. */
    async function execute<T>(config: EndpointConfig): Promise<WithRawResponse<T>> {
        // 1. Query params: endpoint-specific + per-request
        const queryParameters = config.queryParameters
            ? { ...config.queryParameters, ...config.requestOptions?.queryParams }
            : config.requestOptions?.queryParams;

        // 2. Build Fetcher.Args and delegate to fetchWithHeaders for header merging
        const endpointHeaders = config.headers != null ? mergeOnlyDefinedHeaders(config.headers) : {};
        const response = await fetchWithHeaders<T>(
            {
                url: join(
                    config.baseUrl ??
                        (await Supplier.get(options.baseUrl)) ??
                        ((await Supplier.get(options.environment)) as string) ??
                        options.defaultBaseUrl ??
                        "",
                    config.path,
                ),
                method: config.method,
                headers: endpointHeaders as Record<string, string>,
                contentType: config.contentType,
                requestType: config.requestType,
                responseType: config.responseType,
                queryParameters,
                body: config.body,
                duplex: config.duplex,
                timeoutMs: resolveTimeoutMs(config),
                maxRetries: config.requestOptions?.maxRetries ?? options.maxRetries,
                abortSignal: config.requestOptions?.abortSignal,
                withCredentials: config.withCredentials,
                fetchFn: options.fetch,
                logging: options.logging,
            },
            {
                requestHeaders: config.requestOptions?.headers,
                endpointMetadata: config.endpointMetadata,
            },
        );

        // 3. Success
        if (response.ok) {
            const data = config.transformResponse
                ? (config.transformResponse(response.body, response.rawResponse) as T)
                : (response.body as T);
            return { data, rawResponse: response.rawResponse };
        }

        // 4. Status-code errors: use endpoint-specific handler if provided, otherwise generic
        if (response.error.reason === "status-code") {
            if (config.errorHandler) {
                throw config.errorHandler(response.error.statusCode, response.error.body, response.rawResponse);
            }
            throw options.createStatusCodeError({
                statusCode: response.error.statusCode,
                body: response.error.body,
                rawResponse: response.rawResponse,
            });
        }

        // 5. Non-status-code errors (timeout, network, etc.)
        return options.handleNonStatusCodeError(response.error, response.rawResponse, config.method, config.path);
    }

    // Build the RequestFn: call signature + .fetch() method
    function requestFn<T>(config: EndpointConfig | (() => Promise<EndpointConfig>)): HttpResponsePromise<T> {
        if (typeof config === "function") {
            return HttpResponsePromise.fromPromise(config().then((resolved) => execute<T>(resolved)));
        }
        return HttpResponsePromise.fromPromise(execute<T>(config));
    }
    requestFn.fetch = fetchWithHeaders;
    return requestFn;
}
