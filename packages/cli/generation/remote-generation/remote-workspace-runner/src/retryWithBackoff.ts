import { Logger } from "@fern-api/logger";

export interface RetryWithBackoffOptions<T> {
    fn: () => Promise<T>;
    maxRetries: number;
    baseDelayMs: number;
    jitterFactor?: number;
    isRetryable?: (error: unknown) => boolean;
    logger: Logger;
    label?: string;
    delayFn?: (ms: number) => Promise<unknown>;
}

/**
 * Generic retry with exponential backoff and jitter.
 *
 * - Calls `fn` up to `maxRetries + 1` times.
 * - Uses `isRetryable` to decide whether to retry (defaults to always-retry).
 * - Applies exponential backoff with optional jitter between attempts.
 * - Logs a warning before each retry when `label` is provided.
 */
export async function retryWithBackoff<T>({
    fn,
    maxRetries,
    baseDelayMs,
    jitterFactor = 0,
    isRetryable = () => true,
    logger,
    label,
    delayFn = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
}: RetryWithBackoffOptions<T>): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            if (!isRetryable(error) || attempt >= maxRetries) {
                throw error;
            }
            const jitter = jitterFactor > 0 ? 1 + (Math.random() - 0.5) * jitterFactor : 1;
            const delayMs = Math.round(baseDelayMs * 2 ** attempt * jitter);
            if (label != null) {
                logger.warn(`${label} (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delayMs}ms...`);
            }
            await delayFn(delayMs);
        }
    }

    // Unreachable — the loop either returns or throws — but satisfies TypeScript.
    throw lastError;
}
