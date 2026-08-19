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
exports.fetcher = void 0;
exports.fetcherImpl = fetcherImpl;
const json_js_1 = require("../json.js");
const logger_js_1 = require("../logging/logger.js");
const createRequestUrl_js_1 = require("./createRequestUrl.js");
const EndpointSupplier_js_1 = require("./EndpointSupplier.js");
const getErrorResponseBody_js_1 = require("./getErrorResponseBody.js");
const getFetchFn_js_1 = require("./getFetchFn.js");
const getRequestBody_js_1 = require("./getRequestBody.js");
const getResponseBody_js_1 = require("./getResponseBody.js");
const Headers_js_1 = require("./Headers.js");
const makeRequest_js_1 = require("./makeRequest.js");
const RawResponse_js_1 = require("./RawResponse.js");
const redactUrl_js_1 = require("./redactUrl.js");
const requestWithRetries_js_1 = require("./requestWithRetries.js");
const SENSITIVE_HEADERS = new Set([
    "authorization",
    "www-authenticate",
    "x-api-key",
    "api-key",
    "apikey",
    "x-api-token",
    "x-auth-token",
    "auth-token",
    "cookie",
    "set-cookie",
    "proxy-authorization",
    "proxy-authenticate",
    "x-csrf-token",
    "x-xsrf-token",
    "x-session-token",
    "x-access-token",
]);
function redactHeaders(headers) {
    const filtered = {};
    for (const [key, value] of headers instanceof Headers_js_1.Headers ? headers.entries() : Object.entries(headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
            filtered[key] = "[REDACTED]";
        }
        else {
            filtered[key] = value;
        }
    }
    return filtered;
}
function redactQueryParameters(queryParameters) {
    if (queryParameters == null) {
        return undefined;
    }
    const redacted = {};
    for (const [key, value] of Object.entries(queryParameters)) {
        redacted[key] = redactUrl_js_1.SENSITIVE_QUERY_PARAMS.has(key.toLowerCase()) ? "[REDACTED]" : value;
    }
    return redacted;
}
function getHeaders(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const newHeaders = new Headers_js_1.Headers();
        newHeaders.set("Accept", args.responseType === "json"
            ? "application/json"
            : args.responseType === "text"
                ? "text/plain"
                : args.responseType === "sse"
                    ? "text/event-stream"
                    : "*/*");
        if (args.body !== undefined && args.contentType != null) {
            newHeaders.set("Content-Type", args.contentType);
        }
        if (args.headers == null) {
            return newHeaders;
        }
        for (const [key, value] of Object.entries(args.headers)) {
            const result = yield EndpointSupplier_js_1.EndpointSupplier.get(value, { endpointMetadata: (_a = args.endpointMetadata) !== null && _a !== void 0 ? _a : {} });
            if (typeof result === "string") {
                newHeaders.set(key, result);
                continue;
            }
            if (result == null) {
                continue;
            }
            newHeaders.set(key, `${result}`);
        }
        return newHeaders;
    });
}
function fetcherImpl(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let url = args.url;
        if (args.queryString != null && args.queryString.length > 0) {
            url = `${url}?${args.queryString}`;
        }
        else {
            url = (0, createRequestUrl_js_1.createRequestUrl)(args.url, args.queryParameters);
        }
        const requestBody = yield (0, getRequestBody_js_1.getRequestBody)({
            body: args.body,
            type: (_a = args.requestType) !== null && _a !== void 0 ? _a : "other",
        });
        const fetchFn = (_b = args.fetchFn) !== null && _b !== void 0 ? _b : (yield (0, getFetchFn_js_1.getFetchFn)());
        const headers = yield getHeaders(args);
        const logger = (0, logger_js_1.createLogger)(args.logging);
        if (logger.isDebug()) {
            const metadata = {
                method: args.method,
                url: (0, redactUrl_js_1.redactUrl)(url),
                headers: redactHeaders(headers),
                queryParameters: redactQueryParameters(args.queryParameters),
                hasBody: requestBody != null,
            };
            logger.debug("Making HTTP request", metadata);
        }
        try {
            const response = yield (0, requestWithRetries_js_1.requestWithRetries)(() => __awaiter(this, void 0, void 0, function* () {
                return (0, makeRequest_js_1.makeRequest)(fetchFn, url, args.method, headers, requestBody, args.timeoutMs, args.abortSignal, args.withCredentials, args.duplex, args.responseType === "streaming" || args.responseType === "sse");
            }), args.maxRetries);
            if (response.status >= 200 && response.status < 400) {
                if (logger.isDebug()) {
                    const metadata = {
                        method: args.method,
                        url: (0, redactUrl_js_1.redactUrl)(url),
                        statusCode: response.status,
                        responseHeaders: redactHeaders(response.headers),
                    };
                    logger.debug("HTTP request succeeded", metadata);
                }
                const body = yield (0, getResponseBody_js_1.getResponseBody)(response, args.responseType);
                return {
                    ok: true,
                    body: body,
                    headers: response.headers,
                    rawResponse: (0, RawResponse_js_1.toRawResponse)(response),
                };
            }
            else {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: (0, redactUrl_js_1.redactUrl)(url),
                        statusCode: response.status,
                        responseHeaders: redactHeaders(Object.fromEntries(response.headers.entries())),
                    };
                    logger.error("HTTP request failed with error status", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "status-code",
                        statusCode: response.status,
                        body: yield (0, getErrorResponseBody_js_1.getErrorResponseBody)(response),
                    },
                    rawResponse: (0, RawResponse_js_1.toRawResponse)(response),
                };
            }
        }
        catch (error) {
            if ((_c = args.abortSignal) === null || _c === void 0 ? void 0 : _c.aborted) {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: (0, redactUrl_js_1.redactUrl)(url),
                    };
                    logger.error("HTTP request was aborted", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "unknown",
                        errorMessage: "The user aborted a request",
                        cause: error,
                    },
                    rawResponse: RawResponse_js_1.abortRawResponse,
                };
            }
            else if (error instanceof Error && error.name === "AbortError") {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: (0, redactUrl_js_1.redactUrl)(url),
                        timeoutMs: args.timeoutMs,
                    };
                    logger.error("HTTP request timed out", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "timeout",
                        cause: error,
                    },
                    rawResponse: RawResponse_js_1.abortRawResponse,
                };
            }
            else if (error instanceof Error) {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: (0, redactUrl_js_1.redactUrl)(url),
                        errorMessage: error.message,
                    };
                    logger.error("HTTP request failed with error", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "unknown",
                        errorMessage: error.message,
                        cause: error,
                    },
                    rawResponse: RawResponse_js_1.unknownRawResponse,
                };
            }
            if (logger.isError()) {
                const metadata = {
                    method: args.method,
                    url: (0, redactUrl_js_1.redactUrl)(url),
                    error: (0, json_js_1.toJson)(error),
                };
                logger.error("HTTP request failed with unknown error", metadata);
            }
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: (0, json_js_1.toJson)(error),
                    cause: error,
                },
                rawResponse: RawResponse_js_1.unknownRawResponse,
            };
        }
    });
}
exports.fetcher = fetcherImpl;
