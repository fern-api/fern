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
exports.makeRequest = void 0;
exports.isCacheNoStoreSupported = isCacheNoStoreSupported;
exports.resetCacheNoStoreSupported = resetCacheNoStoreSupported;
exports.clearResponseTimeout = clearResponseTimeout;
const signals_js_1 = require("./signals.js");
/**
 * Cached result of checking whether the current runtime supports
 * the `cache` option in `Request`. Some runtimes (e.g. Cloudflare Workers)
 * throw a TypeError when this option is used.
 */
let _cacheNoStoreSupported;
function isCacheNoStoreSupported() {
    if (_cacheNoStoreSupported != null) {
        return _cacheNoStoreSupported;
    }
    try {
        new Request("http://localhost", { cache: "no-store" });
        _cacheNoStoreSupported = true;
    }
    catch (_a) {
        _cacheNoStoreSupported = false;
    }
    return _cacheNoStoreSupported;
}
/**
 * Reset the cached result of `isCacheNoStoreSupported`. Exposed for testing only.
 */
function resetCacheNoStoreSupported() {
    _cacheNoStoreSupported = undefined;
}
const responseTimeouts = new WeakMap();
/**
 * Clears the timeout that `makeRequest` kept running (with `keepTimeoutUntilBodyRead`) so that it also
 * covered reading the response body.
 */
function clearResponseTimeout(response) {
    const timeoutId = responseTimeouts.get(response);
    if (timeoutId != null) {
        clearTimeout(timeoutId);
        responseTimeouts.delete(response);
    }
}
const makeRequest = (fetchFn, url, method, headers, requestBody, timeoutMs, abortSignal, withCredentials, duplex, disableCache, keepTimeoutUntilBodyRead) => __awaiter(void 0, void 0, void 0, function* () {
    const signals = [];
    let timeoutAbortId;
    let timeoutSignal;
    if (timeoutMs != null) {
        const { signal, abortId } = (0, signals_js_1.getTimeoutSignal)(timeoutMs);
        timeoutAbortId = abortId;
        timeoutSignal = signal;
        signals.push(signal);
    }
    if (abortSignal != null) {
        signals.push(abortSignal);
    }
    const newSignals = (0, signals_js_1.anySignal)(signals);
    let response;
    try {
        response = yield fetchFn(url, Object.assign({ method: method, headers, body: requestBody, signal: newSignals, credentials: withCredentials ? "include" : undefined, 
            // @ts-ignore
            duplex }, (disableCache && isCacheNoStoreSupported() ? { cache: "no-store" } : {})));
    }
    catch (error) {
        if (timeoutAbortId != null) {
            clearTimeout(timeoutAbortId);
        }
        // Some runtimes (e.g. Node 18) reject with their own error instead of the abort reason.
        if ((timeoutSignal === null || timeoutSignal === void 0 ? void 0 : timeoutSignal.aborted) && !(abortSignal === null || abortSignal === void 0 ? void 0 : abortSignal.aborted)) {
            throw signals_js_1.TIMEOUT;
        }
        throw error;
    }
    if (timeoutAbortId != null) {
        if (keepTimeoutUntilBodyRead) {
            responseTimeouts.set(response, timeoutAbortId);
        }
        else {
            clearTimeout(timeoutAbortId);
        }
    }
    return response;
});
exports.makeRequest = makeRequest;
