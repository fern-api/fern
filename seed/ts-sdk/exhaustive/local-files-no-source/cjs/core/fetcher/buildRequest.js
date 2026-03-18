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
exports.buildRequest = buildRequest;
const createRequestUrl_js_1 = require("./createRequestUrl.js");
const EndpointSupplier_js_1 = require("./EndpointSupplier.js");
const getRequestBody_js_1 = require("./getRequestBody.js");
/**
 * Build a standard Fetch `Request` object from SDK endpoint arguments.
 * Auth, base URL, headers, query parameters, and serialized body are all baked in.
 * Does NOT send the request or apply retry/timeout logic — the caller owns sending.
 */
function buildRequest(args) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const url = (0, createRequestUrl_js_1.createRequestUrl)(args.url, args.queryParameters);
        const headers = new Headers();
        if (args.body !== undefined && args.contentType != null) {
            headers.set("Content-Type", args.contentType);
        }
        if (args.headers != null) {
            for (const [key, value] of Object.entries(args.headers)) {
                const result = yield EndpointSupplier_js_1.EndpointSupplier.get(value, { endpointMetadata: (_a = args.endpointMetadata) !== null && _a !== void 0 ? _a : {} });
                if (typeof result === "string") {
                    headers.set(key, result);
                    continue;
                }
                if (result == null) {
                    continue;
                }
                headers.set(key, `${result}`);
            }
        }
        const requestBody = yield (0, getRequestBody_js_1.getRequestBody)({
            body: args.body,
            type: (_b = args.requestType) !== null && _b !== void 0 ? _b : "other",
        });
        return new Request(url, {
            method: args.method,
            headers,
            body: requestBody,
        });
    });
}
