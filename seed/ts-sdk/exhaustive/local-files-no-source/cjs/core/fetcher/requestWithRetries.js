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
exports.requestWithRetries = requestWithRetries;
const INITIAL_RETRY_DELAY = 1000; // in milliseconds
const MAX_RETRY_DELAY = 60000; // in milliseconds
const DEFAULT_MAX_RETRIES = 2;
const JITTER_FACTOR = 0.2; // 20% random jitter
function addJitter(delay) {
    // Generate a random value between -JITTER_FACTOR and +JITTER_FACTOR
    const jitterMultiplier = 1 + (Math.random() * 2 - 1) * JITTER_FACTOR;
    return delay * jitterMultiplier;
}
function getRetryDelayFromHeaders(response, retryAttempt) {
    // Check for Retry-After header first (RFC 7231)
    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
        // Parse as number of seconds...
        const retryAfterSeconds = parseInt(retryAfter, 10);
        if (!isNaN(retryAfterSeconds)) {
            // Convert seconds to milliseconds and cap at MAX_RETRY_DELAY
            return Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY);
        }
        // ...or as an HTTP date; both are valid
        const retryAfterDate = new Date(retryAfter);
        if (!isNaN(retryAfterDate.getTime())) {
            const delay = retryAfterDate.getTime() - Date.now();
            return Math.min(Math.max(delay, 0), MAX_RETRY_DELAY);
        }
    }
    // Then check for industry-standard X-RateLimit-Reset header
    const rateLimitReset = response.headers.get("X-RateLimit-Reset");
    if (rateLimitReset) {
        const resetTime = parseInt(rateLimitReset, 10);
        if (!isNaN(resetTime)) {
            // Assume Unix timestamp in epoch seconds
            const delay = resetTime * 1000 - Date.now();
            if (delay > 0) {
                return Math.min(delay, MAX_RETRY_DELAY);
            }
        }
    }
    // Fall back to exponential backoff
    return Math.min(INITIAL_RETRY_DELAY * Math.pow(2, retryAttempt), MAX_RETRY_DELAY);
}
function requestWithRetries(requestFn_1) {
    return __awaiter(this, arguments, void 0, function* (requestFn, maxRetries = DEFAULT_MAX_RETRIES) {
        let response = yield requestFn();
        for (let i = 0; i < maxRetries; ++i) {
            if ([408, 429].includes(response.status) || response.status >= 500) {
                // Get delay from headers or fall back to exponential backoff
                const baseDelay = getRetryDelayFromHeaders(response, i);
                // Add jitter to the delay
                const delayWithJitter = addJitter(baseDelay);
                yield new Promise((resolve) => setTimeout(resolve, delayWithJitter));
                response = yield requestFn();
            }
            else {
                break;
            }
        }
        return response;
    });
}
