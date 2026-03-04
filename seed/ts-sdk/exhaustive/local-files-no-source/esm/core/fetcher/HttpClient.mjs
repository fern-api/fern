var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { mergeHeaders, mergeOnlyDefinedHeaders } from "../headers.mjs";
import { join } from "../url/join.mjs";
import { fetcherImpl } from "./Fetcher.mjs";
import { HttpResponsePromise } from "./HttpResponsePromise.mjs";
import { Supplier } from "./Supplier.mjs";
/**
 * Creates a RequestFn that closes over the provided options.
 * The returned function is the primary API for making HTTP requests in generated SDKs.
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
export function createRequestFn(options) {
    const client = new HttpClient(options, options.createStatusCodeError, options.handleNonStatusCodeError);
    function requestFn(config) {
        return client.request(config);
    }
    requestFn.fetch = (args, opts) => client.fetch(args, opts);
    return requestFn;
}
/**
 * Internal HTTP client class. Not exported publicly — use `createRequestFn` instead.
 *
 * @param options - Normalized client options (baseUrl, auth, headers, etc.)
 * @param createStatusCodeError - Factory to create the SDK-specific generic error for status-code errors.
 * @param handleNonStatusCodeError - Handler for non-status-code errors (timeout, network, unknown, etc.)
 */
export class HttpClient {
    constructor(options, createStatusCodeError, handleNonStatusCodeError) {
        var _a;
        this._options = options;
        this._fetcherFn = (_a = options.fetcher) !== null && _a !== void 0 ? _a : fetcherImpl;
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
    fetch(args, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Merge headers: auth → global → endpoint-specific (args.headers) → per-request
            const authHeaders = this._options.authProvider
                ? (yield this._options.authProvider.getAuthRequest({
                    endpointMetadata: (_a = options === null || options === void 0 ? void 0 : options.endpointMetadata) !== null && _a !== void 0 ? _a : args.endpointMetadata,
                })).headers
                : {};
            const mergedHeaders = mergeHeaders(authHeaders, this._options.headers, args.headers, options === null || options === void 0 ? void 0 : options.requestHeaders);
            return this._fetcherFn(Object.assign(Object.assign({}, args), { headers: mergedHeaders }));
        });
    }
    /**
     * Make an HTTP request. Returns HttpResponsePromise so callers get both
     * `await client.getUser()` and `client.getUser().withRawResponse()` for free.
     *
     * Accepts either a static config or an async config builder function.
     * The async builder is used by endpoints that need async pre-processing
     * (e.g. file upload form data building) while keeping the public method non-async.
     */
    request(config) {
        if (typeof config === "function") {
            return HttpResponsePromise.fromPromise(config().then((resolved) => this._execute(resolved)));
        }
        return HttpResponsePromise.fromPromise(this._execute(config));
    }
    _execute(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            // 1. Query params: endpoint-specific + per-request
            const queryParameters = config.queryParameters
                ? Object.assign(Object.assign({}, config.queryParameters), (_a = config.requestOptions) === null || _a === void 0 ? void 0 : _a.queryParams) : (_b = config.requestOptions) === null || _b === void 0 ? void 0 : _b.queryParams;
            // 2. Build Fetcher.Args and delegate to fetch() for header merging
            const endpointHeaders = config.headers != null ? mergeOnlyDefinedHeaders(config.headers) : {};
            const response = yield this.fetch({
                url: join((_f = (_e = (_d = (_c = config.baseUrl) !== null && _c !== void 0 ? _c : (yield Supplier.get(this._options.baseUrl))) !== null && _d !== void 0 ? _d : (yield Supplier.get(this._options.environment))) !== null && _e !== void 0 ? _e : this._options.defaultBaseUrl) !== null && _f !== void 0 ? _f : "", config.path),
                method: config.method,
                headers: endpointHeaders,
                contentType: config.contentType,
                requestType: config.requestType,
                responseType: config.responseType,
                queryParameters,
                body: config.body,
                duplex: config.duplex,
                timeoutMs: this._resolveTimeoutMs(config),
                maxRetries: (_h = (_g = config.requestOptions) === null || _g === void 0 ? void 0 : _g.maxRetries) !== null && _h !== void 0 ? _h : this._options.maxRetries,
                abortSignal: (_j = config.requestOptions) === null || _j === void 0 ? void 0 : _j.abortSignal,
                withCredentials: config.withCredentials,
                fetchFn: this._options.fetch,
                logging: this._options.logging,
            }, {
                requestHeaders: (_k = config.requestOptions) === null || _k === void 0 ? void 0 : _k.headers,
                endpointMetadata: config.endpointMetadata,
            });
            // 3. Success
            if (response.ok) {
                const data = config.transformResponse
                    ? config.transformResponse(response.body, response.rawResponse)
                    : response.body;
                return { data, rawResponse: response.rawResponse };
            }
            // 4. Status-code errors: check endpoint-specific handler, then fall through to generic
            if (response.error.reason === "status-code") {
                const customError = (_l = config.errorHandler) === null || _l === void 0 ? void 0 : _l.call(config, response.error.statusCode, response.error.body, response.rawResponse);
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
        });
    }
    /**
     * Resolves the timeout in milliseconds for a request.
     * Priority: requestOptions.timeoutInSeconds > client-level > endpoint default > 60s.
     * "infinity" means no timeout (returns undefined).
     */
    _resolveTimeoutMs(config) {
        var _a;
        const requestTimeout = (_a = config.requestOptions) === null || _a === void 0 ? void 0 : _a.timeoutInSeconds;
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
