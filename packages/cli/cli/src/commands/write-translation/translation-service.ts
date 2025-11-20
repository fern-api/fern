const TRANSLATION_SERVICE_URL = "https://r88yjrnw5k.execute-api.us-east-1.amazonaws.com/dev2/translate";

// Retry configuration
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_BASE_DELAY = 1000; // 1 second
const DEFAULT_MAX_DELAY = 30000; // 30 seconds
const DEFAULT_TIMEOUT = 30000; // 30 seconds

import { getToken } from "@fern-api/auth";
import { CliContext } from "../../cli-context/CliContext";

// todo: replace with an SDK
interface RetryConfig {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    timeout?: number;
}

/**
 * Error type that includes Node.js network error codes
 */
type NetworkError = Error & {
    code?: string;
};

/**
 * Determines if an error is retriable based on its characteristics
 */
function isRetriableError(error: NetworkError, response?: Response): boolean {
    // Network errors, timeouts, and connection issues
    // AbortError occurs when fetch is aborted (e.g., via AbortController timeout)
    if (error.name === "AbortError") {
        return true;
    }

    // Node.js network errors have a 'code' property (not 'cause')
    // The 'cause' property is for error chaining (ES2022), which would be another Error object
    if (
        error.code === "ECONNRESET" ||
        error.code === "ENOTFOUND" ||
        error.code === "ECONNREFUSED" ||
        error.code === "ETIMEDOUT"
    ) {
        return true;
    }

    // Check if the error's cause is a Node.js error with a code property
    if (error.cause instanceof Error) {
        const causeWithCode = error.cause as NetworkError;
        if (
            causeWithCode.code === "ECONNRESET" ||
            causeWithCode.code === "ENOTFOUND" ||
            causeWithCode.code === "ECONNREFUSED" ||
            causeWithCode.code === "ETIMEDOUT"
        ) {
            return true;
        }
    }

    // HTTP status codes that might be retriable
    if (response) {
        const status = response.status;
        // 5xx server errors are generally retriable
        if (status >= 500 && status < 600) {
            return true;
        }
        // 429 Too Many Requests is retriable
        if (status === 429) {
            return true;
        }
        // 408 Request Timeout is retriable
        if (status === 408) {
            return true;
        }
    }

    return false;
}

/**
 * Calculates the delay for the next retry attempt using exponential backoff with jitter
 */
function calculateDelay(attempt: number, baseDelay: number, maxDelay: number): number {
    const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // Add up to 10% jitter
    return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Creates a fetch request with timeout support
 */
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(url, {
        ...options,
        signal: controller.signal
    }).finally(() => {
        clearTimeout(timeoutId);
    });
}

export async function translateText({
    text,
    language,
    sourceLanguage,
    fileType,
    cliContext,
    retryConfig = {}
}: {
    text: string;
    language: string;
    sourceLanguage: string;
    fileType?: string;
    cliContext: CliContext;
    retryConfig?: RetryConfig;
}): Promise<string> {
    if (language === sourceLanguage) {
        return text;
    }

    const token = await getToken();
    if (token == null) {
        cliContext.logger.error(
            "Authentication required. Please run 'fern login' or set the FERN_TOKEN environment variable."
        );
        throw new Error("Authentication required for translation service");
    }

    // Set up retry configuration with defaults
    const config = {
        maxRetries: retryConfig.maxRetries ?? DEFAULT_MAX_RETRIES,
        baseDelay: retryConfig.baseDelay ?? DEFAULT_BASE_DELAY,
        maxDelay: retryConfig.maxDelay ?? DEFAULT_MAX_DELAY,
        timeout: retryConfig.timeout ?? DEFAULT_TIMEOUT
    };

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
        try {
            const response = await fetchWithTimeout(
                TRANSLATION_SERVICE_URL,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token.value}`
                    },
                    body: JSON.stringify({
                        text,
                        source_language: sourceLanguage,
                        target_language: language,
                        ...(fileType !== undefined && { file_type: fileType })
                    })
                },
                config.timeout
            );

            if (!response.ok) {
                let errorDetail = "";
                try {
                    const errorBody = await response.json();
                    errorDetail = errorBody.detail || JSON.stringify(errorBody);
                } catch {
                    errorDetail = await response.text();
                }

                // 403 errors should not be retried - they indicate authentication/authorization issues
                if (response.status === 403) {
                    throw new Error(`403: ${errorDetail}`);
                }

                const error = new Error(`HTTP ${response.status}: ${errorDetail}`) as NetworkError;
                if (!isRetriableError(error, response)) {
                    cliContext.logger.debug(`[TRANSLATE] Non-retriable error ${response.status}: ${errorDetail}`);
                    return text;
                }

                // If this is a retriable error and we have attempts left, continue to retry logic
                lastError = error;
                if (attempt <= config.maxRetries) {
                    cliContext.logger.debug(
                        `[TRANSLATE] Attempt ${attempt} failed with status ${response.status}: ${errorDetail}. Retrying...`
                    );
                    const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    continue;
                } else {
                    // Final attempt failed
                    cliContext.logger.debug(
                        `[TRANSLATE] All ${config.maxRetries + 1} attempts failed. Final error: ${errorDetail}`
                    );
                    return text;
                }
            }

            const result = await response.json();

            // Success - log if this was a retry
            if (attempt > 1) {
                cliContext.logger.debug(`[TRANSLATE] Succeeded on attempt ${attempt} after ${attempt - 1} retries`);
            }

            // small delay to avoid timeout issues
            await new Promise((resolve) => setTimeout(resolve, 500));

            return result["translated_text"] ?? text;
        } catch (error: unknown) {
            lastError = error as Error;

            // 403 errors should not be retried - they indicate authentication/authorization issues
            if (error instanceof Error && error.message.includes("403")) {
                throw error;
            }

            // Check if this is a retriable error
            if (error instanceof Error && !isRetriableError(error as NetworkError)) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                cliContext.logger.debug(`[TRANSLATE] Non-retriable error: ${errorMessage}`);
                return text;
            }

            // If this is our final attempt, don't retry
            if (attempt > config.maxRetries) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                cliContext.logger.debug(
                    `[TRANSLATE] All ${config.maxRetries + 1} attempts failed. Final error: ${errorMessage}`
                );
                return text;
            }

            // Log retry attempt and wait before retrying
            const errorMessage = error instanceof Error ? error.message : String(error);
            cliContext.logger.debug(`[TRANSLATE] Attempt ${attempt} failed: ${errorMessage}. Retrying...`);
            const delay = calculateDelay(attempt, config.baseDelay, config.maxDelay);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    // This should never be reached, but just in case
    const lastErrorMessage =
        lastError instanceof Error ? lastError.message : lastError ? String(lastError) : "Unknown error";
    cliContext.logger.debug(`[TRANSLATE] Unexpected end of retry loop. Last error: ${lastErrorMessage}`);
    return text;
}
