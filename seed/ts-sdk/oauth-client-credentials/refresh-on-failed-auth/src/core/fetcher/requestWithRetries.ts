const INITIAL_RETRY_DELAY = 1000; // in milliseconds
const MAX_RETRY_DELAY = 60000; // in milliseconds
const DEFAULT_MAX_RETRIES = 2;
const JITTER_FACTOR = 0.2; // 20% random jitter

const AUTH_FAILURE_STATUS_CODES = [401, 403];

export interface RequestWithRetriesOptions {
    /**
     * Called before retrying a request that failed with 401 or 403.
     * When omitted, auth failures are not retried.
     */
    refreshAuth?: () => Promise<void>;
}

function isAuthFailureStatusCode(statusCode: number): boolean {
    return AUTH_FAILURE_STATUS_CODES.includes(statusCode);
}

function isRetryableStatusCode(statusCode: number): boolean {
    return [408, 429].includes(statusCode) || statusCode >= 500;
}

function addPositiveJitter(delay: number): number {
    const jitterMultiplier = 1 + Math.random() * JITTER_FACTOR;
    return delay * jitterMultiplier;
}

function addSymmetricJitter(delay: number): number {
    const jitterMultiplier = 1 + (Math.random() - 0.5) * JITTER_FACTOR;
    return delay * jitterMultiplier;
}

function getRetryDelayFromHeaders(response: Response, retryAttempt: number): number {
    const retryAfter = response.headers.get("Retry-After");
    if (retryAfter) {
        const retryAfterSeconds = parseInt(retryAfter, 10);
        if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds > 0) {
            return Math.min(retryAfterSeconds * 1000, MAX_RETRY_DELAY);
        }

        const retryAfterDate = new Date(retryAfter);
        if (!Number.isNaN(retryAfterDate.getTime())) {
            const delay = retryAfterDate.getTime() - Date.now();
            if (delay > 0) {
                return Math.min(Math.max(delay, 0), MAX_RETRY_DELAY);
            }
        }
    }

    const rateLimitReset = response.headers.get("X-RateLimit-Reset");
    if (rateLimitReset) {
        const resetTime = parseInt(rateLimitReset, 10);
        if (!Number.isNaN(resetTime)) {
            const delay = resetTime * 1000 - Date.now();
            if (delay > 0) {
                return addPositiveJitter(Math.min(delay, MAX_RETRY_DELAY));
            }
        }
    }

    return addSymmetricJitter(Math.min(INITIAL_RETRY_DELAY * 2 ** retryAttempt, MAX_RETRY_DELAY));
}

export async function requestWithRetries(
    requestFn: () => Promise<Response>,
    maxRetries: number = DEFAULT_MAX_RETRIES,
    { refreshAuth }: RequestWithRetriesOptions = {},
): Promise<Response> {
    let response: Response = await requestFn();

    for (let i = 0; i < maxRetries; ++i) {
        const shouldRefreshAuth = refreshAuth != null && isAuthFailureStatusCode(response.status);
        if (shouldRefreshAuth || isRetryableStatusCode(response.status)) {
            const delay = getRetryDelayFromHeaders(response, i);

            await new Promise((resolve) => setTimeout(resolve, delay));
            if (shouldRefreshAuth) {
                await refreshAuth();
            }
            response = await requestFn();
        } else {
            break;
        }
    }
    return response!;
}
