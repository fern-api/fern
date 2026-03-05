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
 * Injects a RequestFn into an options object for passing to a sub-client constructor.
 *
 * @example
 * ```typescript
 * // Parent client passes its RequestFn to sub-client:
 * new SubClient(core.withRequestFn(this._options, this._requestFn))
 * ```
 */
export function withRequestFn(options, requestFn) {
    return Object.assign(Object.assign({}, options), { _requestFn: requestFn });
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
export function createRequestFn(options) {
    var _a;
    const fetchFn = (_a = options.fetcher) !== null && _a !== void 0 ? _a : fetcherImpl;
    /**
     * Low-level fetch returning the raw APIResponse.
     * Handles auth + global header merging on top of endpoint-specific headers.
     */
    function fetchWithHeaders(args, fetchOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const authHeaders = options.authProvider
                ? (yield options.authProvider.getAuthRequest({
                    endpointMetadata: (_a = fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.endpointMetadata) !== null && _a !== void 0 ? _a : args.endpointMetadata,
                })).headers
                : {};
            const mergedHeaders = mergeHeaders(authHeaders, options.headers, args.headers, fetchOptions === null || fetchOptions === void 0 ? void 0 : fetchOptions.requestHeaders);
            return fetchFn(Object.assign(Object.assign({}, args), { headers: mergedHeaders }));
        });
    }
    /**
     * Resolves the timeout in milliseconds for a request.
     * Priority: requestOptions.timeoutInSeconds > client-level > endpoint default > 60s.
     * "infinity" means no timeout (returns undefined).
     */
    function resolveTimeoutMs(config) {
        var _a;
        const requestTimeout = (_a = config.requestOptions) === null || _a === void 0 ? void 0 : _a.timeoutInSeconds;
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
    function execute(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
            // 1. Query params: endpoint-specific + per-request
            const queryParameters = config.queryParameters
                ? Object.assign(Object.assign({}, config.queryParameters), (_a = config.requestOptions) === null || _a === void 0 ? void 0 : _a.queryParams) : (_b = config.requestOptions) === null || _b === void 0 ? void 0 : _b.queryParams;
            // 2. Build Fetcher.Args and delegate to fetchWithHeaders for header merging
            const endpointHeaders = config.headers != null ? mergeOnlyDefinedHeaders(config.headers) : {};
            const response = yield fetchWithHeaders({
                url: join((_f = (_e = (_d = (_c = config.baseUrl) !== null && _c !== void 0 ? _c : (yield Supplier.get(options.baseUrl))) !== null && _d !== void 0 ? _d : (yield Supplier.get(options.environment))) !== null && _e !== void 0 ? _e : options.defaultBaseUrl) !== null && _f !== void 0 ? _f : "", config.path),
                method: config.method,
                headers: endpointHeaders,
                contentType: config.contentType,
                requestType: config.requestType,
                responseType: config.responseType,
                queryParameters,
                body: config.body,
                duplex: config.duplex,
                timeoutMs: resolveTimeoutMs(config),
                maxRetries: (_h = (_g = config.requestOptions) === null || _g === void 0 ? void 0 : _g.maxRetries) !== null && _h !== void 0 ? _h : options.maxRetries,
                abortSignal: (_j = config.requestOptions) === null || _j === void 0 ? void 0 : _j.abortSignal,
                withCredentials: config.withCredentials,
                fetchFn: options.fetch,
                logging: options.logging,
            }, {
                requestHeaders: (_k = config.requestOptions) === null || _k === void 0 ? void 0 : _k.headers,
                endpointMetadata: config.endpointMetadata,
            });
            // 3. Success — return data as-is; callers use .map() / .mapRaw() for transforms
            if (response.ok) {
                return { data: response.body, rawResponse: response.rawResponse };
            }
            // 4. Status-code errors — throw generic SDK error; callers use .mapError() for discrimination
            if (response.error.reason === "status-code") {
                throw options.createStatusCodeError({
                    statusCode: response.error.statusCode,
                    body: response.error.body,
                    rawResponse: response.rawResponse,
                });
            }
            // 5. Non-status-code errors (timeout, network, etc.)
            return options.handleNonStatusCodeError(response.error, response.rawResponse, config.method, config.path);
        });
    }
    // Build the RequestFn: call signature + .fetch() method
    function requestFn(config) {
        if (typeof config === "function") {
            return HttpResponsePromise.fromPromise(config().then((resolved) => execute(resolved)));
        }
        return HttpResponsePromise.fromPromise(execute(config));
    }
    requestFn.fetch = fetchWithHeaders;
    return requestFn;
}
