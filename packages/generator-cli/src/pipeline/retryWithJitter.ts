const DEFAULT_MAX_ATTEMPTS = 3;
const DEFAULT_INITIAL_DELAY_MS = 1_000;
const DEFAULT_MAX_DELAY_MS = 30_000;
const DEFAULT_JITTER_FACTOR = 0.2;

/**
 * Thrown by an operation to mark a failure as worth retrying, optionally carrying
 * the server's `Retry-After` hint (already converted to milliseconds).
 */
export class RetryableError extends Error {
    readonly retryAfterMs: number | undefined;

    constructor(message: string, options?: { retryAfterMs?: number; cause?: unknown }) {
        super(message, options?.cause != null ? { cause: options.cause } : undefined);
        this.name = "RetryableError";
        this.retryAfterMs = options?.retryAfterMs;
    }
}

export interface RetryOptions {
    /** Total attempts, including the first. Defaults to 3. */
    maxAttempts?: number;
    /** Delay before the second attempt; doubles each subsequent attempt. Defaults to 1000ms. */
    initialDelayMs?: number;
    /** Upper bound on a single delay, applied before jitter. Defaults to 30000ms. */
    maxDelayMs?: number;
    /** Fraction of the delay to randomize by, in both directions. Defaults to 0.2 (±20%). */
    jitterFactor?: number;
    /** Decides whether a thrown error is worth another attempt. Defaults to retrying `RetryableError` only. */
    isRetryable?: (error: unknown) => boolean;
    onRetry?: (info: { attempt: number; maxAttempts: number; delayMs: number; error: unknown }) => void;
    /** Seam for tests; defaults to a real timer. */
    sleep?: (ms: number) => Promise<void>;
}

/**
 * Retries `operation` with exponential backoff and jitter. Jitter spreads the
 * retries of concurrent generations (one per generator, all triggered by the same
 * spec push) so they do not resynchronize onto the same backoff schedule and
 * hammer the service in lockstep.
 */
export async function retryWithJitter<T>(operation: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
    const {
        maxAttempts = DEFAULT_MAX_ATTEMPTS,
        initialDelayMs = DEFAULT_INITIAL_DELAY_MS,
        maxDelayMs = DEFAULT_MAX_DELAY_MS,
        jitterFactor = DEFAULT_JITTER_FACTOR,
        isRetryable = (error: unknown) => error instanceof RetryableError,
        onRetry,
        sleep = defaultSleep
    } = options;

    for (let attempt = 1; ; attempt++) {
        try {
            return await operation();
        } catch (error) {
            if (attempt >= maxAttempts || !isRetryable(error)) {
                throw error;
            }
            const delayMs = computeDelayMs({ attempt, error, initialDelayMs, maxDelayMs, jitterFactor });
            onRetry?.({ attempt, maxAttempts, delayMs, error });
            await sleep(delayMs);
        }
    }
}

function computeDelayMs({
    attempt,
    error,
    initialDelayMs,
    maxDelayMs,
    jitterFactor
}: {
    attempt: number;
    error: unknown;
    initialDelayMs: number;
    maxDelayMs: number;
    jitterFactor: number;
}): number {
    const retryAfterMs = error instanceof RetryableError ? error.retryAfterMs : undefined;
    const base = Math.min(retryAfterMs ?? initialDelayMs * 2 ** (attempt - 1), maxDelayMs);
    const jitter = base * jitterFactor * (Math.random() * 2 - 1);
    return Math.max(0, Math.round(base + jitter));
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Parses a `Retry-After` header, which is either a delay in seconds or an HTTP date.
 */
export function parseRetryAfterMs(headerValue: string | null | undefined): number | undefined {
    if (headerValue == null || headerValue.trim().length === 0) {
        return undefined;
    }
    const seconds = Number(headerValue);
    if (Number.isFinite(seconds)) {
        return seconds >= 0 ? seconds * 1000 : undefined;
    }
    const timestamp = Date.parse(headerValue);
    if (Number.isNaN(timestamp)) {
        return undefined;
    }
    return Math.max(0, timestamp - Date.now());
}
