var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { anySignal, getTimeoutSignal } from "./signals.mjs";
/**
 * Cached result of checking whether the current runtime supports
 * the `cache` option in `Request`. Some runtimes (e.g. Cloudflare Workers)
 * throw a TypeError when this option is used.
 */
let _cacheNoStoreSupported;
export function isCacheNoStoreSupported() {
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
export function resetCacheNoStoreSupported() {
    _cacheNoStoreSupported = undefined;
}
export const makeRequest = (fetchFn, url, method, headers, requestBody, timeoutMs, abortSignal, withCredentials, duplex, disableCache) => __awaiter(void 0, void 0, void 0, function* () {
    const signals = [];
    let timeoutAbortId;
    if (timeoutMs != null) {
        const { signal, abortId } = getTimeoutSignal(timeoutMs);
        timeoutAbortId = abortId;
        signals.push(signal);
    }
    if (abortSignal != null) {
        signals.push(abortSignal);
    }
    const newSignals = anySignal(signals);
    const response = yield fetchFn(url, Object.assign({ method: method, headers, body: requestBody, signal: newSignals, credentials: withCredentials ? "include" : undefined, 
        // @ts-ignore
        duplex }, (disableCache && isCacheNoStoreSupported() ? { cache: "no-store" } : {})));
    if (timeoutAbortId != null) {
        clearTimeout(timeoutAbortId);
    }
    return response;
});
