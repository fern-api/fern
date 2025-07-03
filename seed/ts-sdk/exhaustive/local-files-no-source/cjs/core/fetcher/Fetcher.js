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
const RawResponse_js_1 = require("./RawResponse.js");
const Supplier_js_1 = require("./Supplier.js");
const createRequestUrl_js_1 = require("./createRequestUrl.js");
const getFetchFn_js_1 = require("./getFetchFn.js");
const getRequestBody_js_1 = require("./getRequestBody.js");
const getResponseBody_js_1 = require("./getResponseBody.js");
const makeRequest_js_1 = require("./makeRequest.js");
const requestWithRetries_js_1 = require("./requestWithRetries.js");
function getHeaders(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const newHeaders = {};
        if (args.body !== undefined && args.contentType != null) {
            newHeaders["Content-Type"] = args.contentType;
        }
        if (args.headers == null) {
            return newHeaders;
        }
        for (const [key, value] of Object.entries(args.headers)) {
            const result = yield Supplier_js_1.Supplier.get(value);
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
function fetcherImpl(args) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = (0, createRequestUrl_js_1.createRequestUrl)(args.url, args.queryParameters);
        const requestBody = yield (0, getRequestBody_js_1.getRequestBody)({
            body: args.body,
            type: args.requestType === "json" ? "json" : "other",
        });
        const fetchFn = yield (0, getFetchFn_js_1.getFetchFn)();
        try {
            const response = yield (0, requestWithRetries_js_1.requestWithRetries)(() => __awaiter(this, void 0, void 0, function* () {
                return (0, makeRequest_js_1.makeRequest)(fetchFn, url, args.method, yield getHeaders(args), requestBody, args.timeoutMs, args.abortSignal, args.withCredentials, args.duplex);
            }), args.maxRetries);
            const responseBody = yield (0, getResponseBody_js_1.getResponseBody)(response, args.responseType);
            if (response.status >= 200 && response.status < 400) {
                return {
                    ok: true,
                    body: responseBody,
                    headers: response.headers,
                    rawResponse: (0, RawResponse_js_1.toRawResponse)(response),
                };
            }
            else {
                return {
                    ok: false,
                    error: {
                        reason: "status-code",
                        statusCode: response.status,
                        body: responseBody,
                    },
                    rawResponse: (0, RawResponse_js_1.toRawResponse)(response),
                };
            }
        }
        catch (error) {
            if (args.abortSignal != null && args.abortSignal.aborted) {
                return {
                    ok: false,
                    error: {
                        reason: "unknown",
                        errorMessage: "The user aborted a request",
                    },
                    rawResponse: RawResponse_js_1.abortRawResponse,
                };
            }
            else if (error instanceof Error && error.name === "AbortError") {
                return {
                    ok: false,
                    error: {
                        reason: "timeout",
                    },
                    rawResponse: RawResponse_js_1.abortRawResponse,
                };
            }
            else if (error instanceof Error) {
                return {
                    ok: false,
                    error: {
                        reason: "unknown",
                        errorMessage: error.message,
                    },
                    rawResponse: RawResponse_js_1.unknownRawResponse,
                };
            }
            return {
                ok: false,
                error: {
                    reason: "unknown",
                    errorMessage: (0, json_js_1.toJson)(error),
                },
                rawResponse: RawResponse_js_1.unknownRawResponse,
            };
        }
    });
}
exports.fetcher = fetcherImpl;
