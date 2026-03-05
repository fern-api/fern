import { Logger } from "@fern-api/logger";

const RATE_LIMIT_INITIAL_RETRY_DELAY_MS = 2_000;
const RATE_LIMIT_MAX_RETRY_DELAY_MS = 120_000;
const RATE_LIMIT_MAX_RETRIES = 3;
const RATE_LIMIT_JITTER_FACTOR = 0.2;

export class TooManyRequestsError extends Error {
    public readonly retryAfterSeconds: number | undefined;

    constructor(retryAfterSeconds?: number) {
        super("Received 429 Too Many Requests");
        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}

/**
 * Wraps a function call with optional retry logic for 429 Too Many Requests errors.
 *
 * When `retryRateLimited` is false and a TooManyRequestsError is thrown, it calls `onRateLimitedWithoutRetry`
 * to let the caller handle it (e.g. show a helpful message suggesting --retry-rate-limited).
 *
 * When `retryRateLimited` is true, retries up to RATE_LIMIT_MAX_RETRIES times with:
 * - Server-provided Retry-After delay (if available), plus jitter
 * - Exponential backoff with jitter as fallback (2s initial, 120s max)
 */
export async function retryWithRateLimit<T>({
    fn,
    retryRateLimited,
    logger,
    onRateLimitedWithoutRetry,
    delayFn = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
}: {
    fn: () => Promise<T>;
    retryRateLimited: boolean;
    logger: Logger;
    onRateLimitedWithoutRetry: () => never;
    delayFn?: (ms: number) => Promise<unknown>;
}): Promise<T> {
    if (!retryRateLimited) {
        try {
            return await fn();
        } catch (error) {
            if (error instanceof TooManyRequestsError) {
                return onRateLimitedWithoutRetry();
            }
            throw error;
        }
    }

    for (let attempt = 0; attempt <= RATE_LIMIT_MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (error) {
            if (error instanceof TooManyRequestsError && attempt < RATE_LIMIT_MAX_RETRIES) {
                const retryAfterSeconds = error.retryAfterSeconds;
                let delay: number;
                if (retryAfterSeconds != null) {
                    // Use the server-provided Retry-After value with a small jitter, capped at max
                    const jitter = 1 + (Math.random() - 0.5) * RATE_LIMIT_JITTER_FACTOR;
                    delay = Math.min(Math.round(retryAfterSeconds * 1000 * jitter), RATE_LIMIT_MAX_RETRY_DELAY_MS);
                } else {
                    // Fall back to exponential backoff with jitter
                    const baseDelay = Math.min(
                        RATE_LIMIT_INITIAL_RETRY_DELAY_MS * 2 ** attempt,
                        RATE_LIMIT_MAX_RETRY_DELAY_MS
                    );
                    const jitter = 1 + (Math.random() - 0.5) * RATE_LIMIT_JITTER_FACTOR;
                    delay = Math.round(baseDelay * jitter);
                }
                logger.warn(
                    `Received 429 Too Many Requests. Retrying in ${(delay / 1000).toFixed(1)}s (attempt ${attempt + 1}/${RATE_LIMIT_MAX_RETRIES})...`
                );
                await delayFn(delay);
            } else {
                throw error;
            }
        }
    }

    // Unreachable, but TypeScript needs this
    throw new Error("Exceeded maximum retries for 429 Too Many Requests.");
}
