import { toQueryString } from "../url/qs.js";

const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Validates that the URL uses HTTPS for non-localhost hosts.
 * Throws an error if the URL uses HTTP for a non-localhost host,
 * preventing accidental transmission of credentials in plaintext.
 */
function validateHttps(url: string): void {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return;
    }
    if (parsed.protocol !== "http:") {
        return;
    }
    if (LOCALHOST_HOSTS.has(parsed.hostname) || parsed.hostname.endsWith(".localhost")) {
        return;
    }
    throw new Error(
        `Refusing to send request to non-HTTPS URL: ${url}. HTTP is only allowed for localhost. Use HTTPS or pass a localhost URL.`,
    );
}

export function createRequestUrl(baseUrl: string, queryParameters?: Record<string, unknown>): string {
    validateHttps(baseUrl);
    const queryString = toQueryString(queryParameters, { arrayFormat: "repeat" });
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}
