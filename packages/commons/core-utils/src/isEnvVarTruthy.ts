const TRUTHY_VALUES = new Set(["1", "true", "yes", "on"]);

/**
 * Returns true when an environment variable is set to an affirmative value
 * ("1", "true", "yes", "on" — case-insensitive). Anything else, including an
 * unset variable, is false.
 *
 * Surrounding quotes are stripped before comparison: container runtimes are
 * invoked without a shell, so a value forwarded as `-e KEY="true"` arrives with
 * the quote characters intact.
 */
export function isEnvVarTruthy(value: string | undefined): boolean {
    if (value == null) {
        return false;
    }
    const normalized = value
        .trim()
        .replace(/^["']|["']$/g, "")
        .trim()
        .toLowerCase();
    return TRUTHY_VALUES.has(normalized);
}
