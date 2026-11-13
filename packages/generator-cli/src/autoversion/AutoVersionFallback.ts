/**
 * Why `--version AUTO` could not fully analyze the diff:
 *  - `diff-too-large`: the cleaned diff exceeded MAX_RAW_DIFF_BYTES; no AI analysis ran.
 *  - `analysis-failed`: every AI request failed (network error, rate limit, timeout, …).
 *  - `partial-analysis`: only part of the diff was analyzed (chunk cap or some chunk requests failed).
 */
export type AutoVersionFallbackReason = "diff-too-large" | "analysis-failed" | "partial-analysis";

export const AUTO_VERSION_FALLBACK_LOG_PREFIX = "AUTO versioning fallback:";

const FALLBACK_LOG_REGEX = /AUTO versioning fallback: reason=(diff-too-large|analysis-failed|partial-analysis)\b/;

/**
 * Stable, machine-readable log line, e.g.
 * `AUTO versioning fallback: reason=diff-too-large (diff too large for FAI (61234KB, limit 50000KB))`.
 * CI can match on `reason=<code>`; the text in parentheses is human-readable and may change.
 */
export function formatAutoVersionFallbackLog(reason: AutoVersionFallbackReason, detail?: string): string {
    const suffix = detail != null && detail.trim().length > 0 ? ` (${detail.trim()})` : "";
    return `${AUTO_VERSION_FALLBACK_LOG_PREFIX} reason=${reason}${suffix}`;
}

export function parseAutoVersionFallbackReason(message: string): AutoVersionFallbackReason | undefined {
    const match = message.match(FALLBACK_LOG_REGEX);
    switch (match?.[1]) {
        case "diff-too-large":
        case "analysis-failed":
        case "partial-analysis":
            return match[1];
        default:
            return undefined;
    }
}
