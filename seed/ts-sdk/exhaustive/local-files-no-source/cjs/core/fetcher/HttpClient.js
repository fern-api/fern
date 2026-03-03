"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const headers_js_1 = require("../headers.js");
const join_js_1 = require("../url/join.js");
const Fetcher_js_1 = require("./Fetcher.js");
const HttpResponsePromise_js_1 = require("./HttpResponsePromise.js");
const Supplier_js_1 = require("./Supplier.js");
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
class HttpClient {
    constructor(options, createStatusCodeError, handleNonStatusCodeError) {
        var _a;
        this._options = options;
        this._fetcherFn = (_a = options.fetcher) !== null && _a !== void 0 ? _a : Fetcher_js_1.fetcherImpl;
        this._createStatusCodeError = createStatusCodeError;
        this._handleNonStatusCodeError = handleNonStatusCodeError;
    }
    /** Expose normalized options for sub-clients that need them (e.g. pagination) */
    get options() {
        return this._options;
    }
    /**
     * Low-level fetch that takes the same args as core.fetcher() and returns the raw APIResponse.
     * Used by complex endpoints (streaming, pagination, file upload, non-throwing) that need
     * to handle the response themselves. ALL HTTP calls should go through this method.
     */
    fetch(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._fetcherFn(args);
        });
    }
    /**
     * Make an HTTP request. Returns HttpResponsePromise so callers get both
     * `await client.getUser()` and `client.getUser().withRawResponse()` for free.
     */
    request(config) {
        return HttpResponsePromise_js_1.HttpResponsePromise.fromPromise(this._execute(config));
    }
    _execute(config) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            // 1. Auth
            const authHeaders = this._options.authProvider
                ? (yield this._options.authProvider.getAuthRequest({ endpointMetadata: config.endpointMetadata })).headers
                : {};
            // 2. Headers: auth → global → endpoint-specific → per-request
            //    This matches the exact merge order of the existing generated code:
            //    mergeHeaders(authHeaders, this._options?.headers, [mergeOnlyDefinedHeaders({...}),] requestOptions?.headers)
            const headers = (0, headers_js_1.mergeHeaders)(authHeaders, this._options.headers, config.headers != null ? (0, headers_js_1.mergeOnlyDefinedHeaders)(config.headers) : undefined, (_a = config.requestOptions) === null || _a === void 0 ? void 0 : _a.headers);
            // 3. Query params: endpoint-specific + per-request
            const queryParameters = config.queryParameters
                ? Object.assign(Object.assign({}, config.queryParameters), (_b = config.requestOptions) === null || _b === void 0 ? void 0 : _b.queryParams) : (_c = config.requestOptions) === null || _c === void 0 ? void 0 : _c.queryParams;
            // 4. Fetch — uses the configured fetcher (custom or default fetcherImpl)
            const response = yield this._fetcherFn({
                url: (0, join_js_1.join)((_e = (_d = (yield Supplier_js_1.Supplier.get(this._options.baseUrl))) !== null && _d !== void 0 ? _d : (yield Supplier_js_1.Supplier.get(this._options.environment))) !== null && _e !== void 0 ? _e : "", config.path),
                method: config.method,
                headers,
                contentType: config.contentType,
                requestType: config.requestType,
                responseType: config.responseType,
                queryParameters,
                body: config.body,
                duplex: config.duplex,
                timeoutMs: ((_h = (_g = (_f = config.requestOptions) === null || _f === void 0 ? void 0 : _f.timeoutInSeconds) !== null && _g !== void 0 ? _g : this._options.timeoutInSeconds) !== null && _h !== void 0 ? _h : 60) * 1000,
                maxRetries: (_k = (_j = config.requestOptions) === null || _j === void 0 ? void 0 : _j.maxRetries) !== null && _k !== void 0 ? _k : this._options.maxRetries,
                abortSignal: (_l = config.requestOptions) === null || _l === void 0 ? void 0 : _l.abortSignal,
                withCredentials: config.withCredentials,
                fetchFn: this._options.fetch,
                logging: this._options.logging,
                endpointMetadata: config.endpointMetadata,
            });
            // 5. Success
            if (response.ok) {
                const data = config.transformResponse
                    ? config.transformResponse(response.body)
                    : response.body;
                return { data, rawResponse: response.rawResponse };
            }
            // 6. Status-code errors: check endpoint-specific map, then fall through to generic
            if (response.error.reason === "status-code") {
                const factory = (_m = config.errorMap) === null || _m === void 0 ? void 0 : _m[response.error.statusCode];
                if (factory) {
                    throw factory(response.error.body, response.rawResponse);
                }
                throw this._createStatusCodeError({
                    statusCode: response.error.statusCode,
                    body: response.error.body,
                    rawResponse: response.rawResponse,
                });
            }
            // 7. Non-status-code errors (timeout, network, etc.)
            return this._handleNonStatusCodeError(response.error, response.rawResponse, config.method, config.path);
        });
    }
}
exports.HttpClient = HttpClient;
