import { Logger } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";

const RATE_LIMIT_INITIAL_RETRY_DELAY_MS = 2_000;
const RATE_LIMIT_MAX_RETRY_DELAY_MS = 120_000;
const RATE_LIMIT_MAX_RETRIES = 5;
const RATE_LIMIT_JITTER_FACTOR = 0.5;

export class TooManyRequestsError extends Error {
    readonly retryAfterSeconds: number | undefined;

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
 * When `retryRateLimited` is true, retries up to RATE_LIMIT_MAX_RETRIES times.
 * If the server provides a retryAfter hint, that value (in seconds) is used as the
 * minimum delay. Otherwise, exponential backoff with jitter is applied
 * (2s initial, 120s max, 0.5 jitter factor).
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
                const baseDelay = Math.min(
                    RATE_LIMIT_INITIAL_RETRY_DELAY_MS * 2 ** attempt,
                    RATE_LIMIT_MAX_RETRY_DELAY_MS
                );
                const serverHintMs = error.retryAfterSeconds != null ? error.retryAfterSeconds * 1000 : undefined;
                const effectiveBase = serverHintMs != null ? Math.max(baseDelay, serverHintMs) : baseDelay;
                const jitter = 1 + (Math.random() - 0.5) * RATE_LIMIT_JITTER_FACTOR;
                const delay = Math.round(
                    Math.min(Math.max(effectiveBase * jitter, serverHintMs ?? 0), RATE_LIMIT_MAX_RETRY_DELAY_MS)
                );
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
    throw new CliError({
        message: "Exceeded maximum retries for 429 Too Many Requests.",
        code: CliError.Code.InternalError
    });
}
