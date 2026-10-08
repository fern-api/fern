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
exports.getErrorResponseBody = getErrorResponseBody;
const json_js_1 = require("../json.js");
const getResponseBody_js_1 = require("./getResponseBody.js");
/** Parses a JSON error body, falling back to the raw text so the status and body are never lost. */
function parseJsonErrorBody(text) {
    if (text.length === 0) {
        return undefined;
    }
    try {
        return (0, json_js_1.fromJson)(text);
    }
    catch (_a) {
        return text;
    }
}
function getErrorResponseBody(response) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        let contentType = (_a = response.headers.get("Content-Type")) === null || _a === void 0 ? void 0 : _a.toLowerCase();
        if (contentType == null || contentType.length === 0) {
            const body = yield (0, getResponseBody_js_1.getResponseBody)(response);
            if ((0, getResponseBody_js_1.isResponseBodyError)(body)) {
                return body.error.reason === "non-json" ? body.error.rawBody : undefined;
            }
            return body;
        }
        if (contentType.indexOf(";") !== -1) {
            contentType = (_c = (_b = contentType.split(";")[0]) === null || _b === void 0 ? void 0 : _b.trim()) !== null && _c !== void 0 ? _c : "";
        }
        switch (contentType) {
            case "application/hal+json":
            case "application/json":
            case "application/ld+json":
            case "application/problem+json":
            case "application/vnd.api+json":
            case "text/json":
                return parseJsonErrorBody(yield response.text());
            default:
                if (contentType.startsWith("application/vnd.") && contentType.endsWith("+json")) {
                    return parseJsonErrorBody(yield response.text());
                }
                // Fallback to plain text if content type is not recognized
                // Even if no body is present, the response will be an empty string
                return yield response.text();
        }
    });
}
