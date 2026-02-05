/**
 * Checks if an error is a network-related error (DNS resolution failure, connection refused, etc.)
 * that typically indicates an air-gapped or offline environment.
 */
function isNetworkError(error: unknown): boolean {
    if (error == null) {
        return false;
    }

    const errorString = String(error);
    const errorMessage = error instanceof Error ? error.message : "";
    const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
    const causeString = cause != null ? String(cause) : "";

    // Check for common network error indicators
    const networkErrorPatterns = [
        "ENOTFOUND", // DNS resolution failure
        "ECONNREFUSED", // Connection refused
        "ETIMEDOUT", // Connection timed out
        "ENETUNREACH", // Network unreachable
        "EHOSTUNREACH", // Host unreachable
        "EAI_AGAIN", // DNS lookup timed out
        "fetch failed", // Generic fetch failure
        "network error", // Generic network error
        "NetworkError" // PostHog network error type
    ];

    for (const pattern of networkErrorPatterns) {
        if (errorString.includes(pattern) || errorMessage.includes(pattern) || causeString.includes(pattern)) {
            return true;
        }
    }

    return false;
}

/**
 * Logs PostHog errors with user-friendly messages.
 * Network errors (air-gapped/offline) are logged as debug warnings.
 * Other errors are logged as debug errors with full details.
 */
export function logPosthogError(error: unknown): void {
    if (isNetworkError(error)) {
        // biome-ignore lint/suspicious/noConsole: intentional debug logging for internal troubleshooting
        console.debug("[PostHog] Analytics unavailable due to air-gapped or offline environment.");
    } else {
        // biome-ignore lint/suspicious/noConsole: intentional debug logging for internal troubleshooting
        console.debug("[PostHog] Failed to flush analytics. Full error:");
        // biome-ignore lint/suspicious/noConsole: intentional debug logging for internal troubleshooting
        console.debug("    ", error);
    }
}
