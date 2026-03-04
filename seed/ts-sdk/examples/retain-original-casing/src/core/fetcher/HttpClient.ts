import { mergeHeaders, mergeOnlyDefinedHeaders } from "../headers.js";
import type { LogConfig, Logger } from "../logging/logger.js";
import { join } from "../url/join.js";
import type { APIResponse } from "./APIResponse.js";
import type { Fetcher, FetchFunction } from "./Fetcher.js";
import { fetcherImpl } from "./Fetcher.js";
import { HttpResponsePromise } from "./HttpResponsePromise.js";
import type { RawResponse, WithRawResponse } from "./RawResponse.js";
import { Supplier } from "./Supplier.js";

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
     * Return an Error to throw it, or undefined to fall through to the generic SDK error.
     */
    errorHandler?: (statusCode: number, body: unknown, rawResponse: RawResponse) => Error | undefined;
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
 * Options for constructing an HttpClient.
 *
 * Structurally compatible with the generated `NormalizedClientOptions` —
 * the generated client passes its normalized options directly to this constructor.
 */
export interface HttpClientOptions {
    baseUrl?: Supplier<string>;
    environment?: Supplier<string>;
    authProvider?: {
        getAuthRequest(arg?: {
            endpointMetadata?: Record<string, unknown>;
        }): Promise<{ headers: Record<string, string> }>;
    };
    headers?: Record<string, string | Supplier<string | null | undefined> | null | undefined>;
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
    private readonly _createStatusCodeError: (args: {
        statusCode: number;
        body: unknown;
        rawResponse: RawResponse;
    }) => Error;
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
        options?: { requestHeaders?: Record<string, unknown>; endpointMetadata?: Record<string, unknown> },
    ): Promise<APIResponse<R, Fetcher.Error>> {
        // Merge headers: auth → global → endpoint-specific (args.headers) → per-request
        const authHeaders: Record<string, string> = this._options.authProvider
            ? (
                  await this._options.authProvider.getAuthRequest({
                      endpointMetadata: options?.endpointMetadata ?? args.endpointMetadata,
                  })
              ).headers
            : {};
        const mergedHeaders = mergeHeaders(authHeaders, this._options.headers, args.headers, options?.requestHeaders);
        return this._fetcherFn<R>({ ...args, headers: mergedHeaders });
    }

    /**
     * Make an HTTP request. Returns HttpResponsePromise so callers get both
     * `await client.getUser()` and `client.getUser().withRawResponse()` for free.
     *
     * Accepts either a static config or an async config builder function.
     * The async builder is used by endpoints that need async pre-processing
     * (e.g. file upload form data building) while keeping the public method non-async.
     */
    public request<T>(config: EndpointConfig | (() => Promise<EndpointConfig>)): HttpResponsePromise<T> {
        if (typeof config === "function") {
            return HttpResponsePromise.fromPromise(config().then((resolved) => this._execute<T>(resolved)));
        }
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
                    config.baseUrl ??
                        (await Supplier.get(this._options.baseUrl)) ??
                        ((await Supplier.get(this._options.environment)) as string) ??
                        this._options.defaultBaseUrl ??
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
                timeoutMs: this._resolveTimeoutMs(config),
                maxRetries: config.requestOptions?.maxRetries ?? this._options.maxRetries,
                abortSignal: config.requestOptions?.abortSignal,
                withCredentials: config.withCredentials,
                fetchFn: this._options.fetch,
                logging: this._options.logging,
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

        // 4. Status-code errors: check endpoint-specific handler, then fall through to generic
        if (response.error.reason === "status-code") {
            const customError = config.errorHandler?.(
                response.error.statusCode,
                response.error.body,
                response.rawResponse,
            );
            if (customError) {
                throw customError;
            }
            throw this._createStatusCodeError({
                statusCode: response.error.statusCode,
                body: response.error.body,
                rawResponse: response.rawResponse,
            });
        }

        // 5. Non-status-code errors (timeout, network, etc.)
        return this._handleNonStatusCodeError(response.error, response.rawResponse, config.method, config.path);
    }

    /**
     * Resolves the timeout in milliseconds for a request.
     * Priority: requestOptions.timeoutInSeconds > client-level > endpoint default > 60s.
     * "infinity" means no timeout (returns undefined).
     */
    private _resolveTimeoutMs(config: EndpointConfig): number | undefined {
        const requestTimeout = config.requestOptions?.timeoutInSeconds;
        if (requestTimeout != null) {
            return requestTimeout * 1000;
        }
        const clientTimeout = this._options.timeoutInSeconds;
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
}
