var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { toJson } from "../json.mjs";
import { createLogger } from "../logging/logger.mjs";
import { createRequestUrl } from "./createRequestUrl.mjs";
import { EndpointSupplier } from "./EndpointSupplier.mjs";
import { getErrorResponseBody } from "./getErrorResponseBody.mjs";
import { getFetchFn } from "./getFetchFn.mjs";
import { getRequestBody } from "./getRequestBody.mjs";
import { getResponseBody } from "./getResponseBody.mjs";
import { makeRequest } from "./makeRequest.mjs";
import { abortRawResponse, toRawResponse, unknownRawResponse } from "./RawResponse.mjs";
import { requestWithRetries } from "./requestWithRetries.mjs";
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
    for (const [key, value] of Object.entries(headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
            filtered[key] = "[REDACTED]";
        }
        else {
            filtered[key] = value;
        }
    }
    return filtered;
}
const SENSITIVE_QUERY_PARAMS = new Set([
    "api_key",
    "api-key",
    "apikey",
    "token",
    "access_token",
    "access-token",
    "auth_token",
    "auth-token",
    "password",
    "passwd",
    "secret",
    "api_secret",
    "api-secret",
    "apisecret",
    "key",
    "session",
    "session_id",
    "session-id",
]);
function redactQueryParameters(queryParameters) {
    if (queryParameters == null) {
        return queryParameters;
    }
    const redacted = {};
    for (const [key, value] of Object.entries(queryParameters)) {
        if (SENSITIVE_QUERY_PARAMS.has(key.toLowerCase())) {
            redacted[key] = "[REDACTED]";
        }
        else {
            redacted[key] = value;
        }
    }
    return redacted;
}
function redactUrl(url) {
    const protocolIndex = url.indexOf("://");
    if (protocolIndex === -1)
        return url;
    const afterProtocol = protocolIndex + 3;
    // Find the first delimiter that marks the end of the authority section
    const pathStart = url.indexOf("/", afterProtocol);
    let queryStart = url.indexOf("?", afterProtocol);
    let fragmentStart = url.indexOf("#", afterProtocol);
    const firstDelimiter = Math.min(pathStart === -1 ? url.length : pathStart, queryStart === -1 ? url.length : queryStart, fragmentStart === -1 ? url.length : fragmentStart);
    // Find the LAST @ before the delimiter (handles multiple @ in credentials)
    let atIndex = -1;
    for (let i = afterProtocol; i < firstDelimiter; i++) {
        if (url[i] === "@") {
            atIndex = i;
        }
    }
    if (atIndex !== -1) {
        url = `${url.slice(0, afterProtocol)}[REDACTED]@${url.slice(atIndex + 1)}`;
    }
    // Recalculate queryStart since url might have changed
    queryStart = url.indexOf("?");
    if (queryStart === -1)
        return url;
    fragmentStart = url.indexOf("#", queryStart);
    const queryEnd = fragmentStart !== -1 ? fragmentStart : url.length;
    const queryString = url.slice(queryStart + 1, queryEnd);
    if (queryString.length === 0)
        return url;
    // FAST PATH: Quick check if any sensitive keywords present
    // Using indexOf is faster than regex for simple substring matching
    const lower = queryString.toLowerCase();
    const hasSensitive = lower.includes("token") ||
        lower.includes("key") ||
        lower.includes("password") ||
        lower.includes("passwd") ||
        lower.includes("secret") ||
        lower.includes("session") ||
        lower.includes("auth");
    if (!hasSensitive) {
        return url;
    }
    // SLOW PATH: Parse and redact
    const redactedParams = [];
    const params = queryString.split("&");
    for (const param of params) {
        const equalIndex = param.indexOf("=");
        if (equalIndex === -1) {
            redactedParams.push(param);
            continue;
        }
        const key = param.slice(0, equalIndex);
        let shouldRedact = SENSITIVE_QUERY_PARAMS.has(key.toLowerCase());
        if (!shouldRedact && key.includes("%")) {
            try {
                const decodedKey = decodeURIComponent(key);
                shouldRedact = SENSITIVE_QUERY_PARAMS.has(decodedKey.toLowerCase());
            }
            catch (_a) { }
        }
        redactedParams.push(shouldRedact ? `${key}=[REDACTED]` : param);
    }
    return url.slice(0, queryStart + 1) + redactedParams.join("&") + url.slice(queryEnd);
}
function getHeaders(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const newHeaders = {};
        if (args.body !== undefined && args.contentType != null) {
            newHeaders["Content-Type"] = args.contentType;
        }
        if (args.headers == null) {
            return newHeaders;
        }
        for (const [key, value] of Object.entries(args.headers)) {
            const result = yield EndpointSupplier.get(value, { endpointMetadata: (_a = args.endpointMetadata) !== null && _a !== void 0 ? _a : {} });
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
    });
}
export function fetcherImpl(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const url = createRequestUrl(args.url, args.queryParameters);
        const requestBody = yield getRequestBody({
            body: args.body,
            type: (_a = args.requestType) !== null && _a !== void 0 ? _a : "other",
        });
        const fetchFn = (_b = args.fetchFn) !== null && _b !== void 0 ? _b : (yield getFetchFn());
        const headers = yield getHeaders(args);
        const logger = createLogger(args.logging);
        if (logger.isDebug()) {
            const metadata = {
                method: args.method,
                url: redactUrl(url),
                headers: redactHeaders(headers),
                queryParameters: redactQueryParameters(args.queryParameters),
                hasBody: requestBody != null,
            };
            logger.debug("Making HTTP request", metadata);
        }
        try {
            const response = yield requestWithRetries(() => __awaiter(this, void 0, void 0, function* () {
                return makeRequest(fetchFn, url, args.method, headers, requestBody, args.timeoutMs, args.abortSignal, args.withCredentials, args.duplex);
            }), args.maxRetries);
            if (response.status >= 200 && response.status < 400) {
                if (logger.isDebug()) {
                    const metadata = {
                        method: args.method,
                        url: redactUrl(url),
                        statusCode: response.status,
                        responseHeaders: redactHeaders(Object.fromEntries(response.headers.entries())),
                    };
                    logger.debug("HTTP request succeeded", metadata);
                }
                return {
                    ok: true,
                    body: (yield getResponseBody(response, args.responseType)),
                    headers: response.headers,
                    rawResponse: toRawResponse(response),
                };
            }
            else {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: redactUrl(url),
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
                        body: yield getErrorResponseBody(response),
                    },
                    rawResponse: toRawResponse(response),
                };
            }
        }
        catch (error) {
            if ((_c = args.abortSignal) === null || _c === void 0 ? void 0 : _c.aborted) {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: redactUrl(url),
                    };
                    logger.error("HTTP request was aborted", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "unknown",
                        errorMessage: "The user aborted a request",
                    },
                    rawResponse: abortRawResponse,
                };
            }
            else if (error instanceof Error && error.name === "AbortError") {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: redactUrl(url),
                        timeoutMs: args.timeoutMs,
                    };
                    logger.error("HTTP request timed out", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "timeout",
                    },
                    rawResponse: abortRawResponse,
                };
            }
            else if (error instanceof Error) {
                if (logger.isError()) {
                    const metadata = {
                        method: args.method,
                        url: redactUrl(url),
                        errorMessage: error.message,
                    };
                    logger.error("HTTP request failed with error", metadata);
                }
                return {
                    ok: false,
                    error: {
                        reason: "unknown",
                        errorMessage: error.message,
                    },
                    rawResponse: unknownRawResponse,
                };
            }
            if (logger.isError()) {
                const metadata = {
                    method: args.method,
                    url: redactUrl(url),
                    error: toJson(error),
                };
                logger.error("HTTP request failed with unknown error", metadata);
            }
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: toJson(error),
                },
                rawResponse: unknownRawResponse,
            };
        }
    });
}
export const fetcher = fetcherImpl;
