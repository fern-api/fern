/**
 * Normalizes an instance URL for comparison by:
 * - Stripping https:// and http:// prefixes (case-insensitive)
 * - Lowercasing the host portion (domains are case-insensitive)
 * - Preserving the path portion (paths can be case-sensitive)
 * - Removing trailing slash (except for root path)
 * - Trimming whitespace
 *
 * Examples:
 * - "https://docs.example.com" -> "docs.example.com"
 * - "HTTPS://Docs.Example.Com/path" -> "docs.example.com/path"
 * - "docs.example.com/" -> "docs.example.com"
 * - "docs.example.com/de/" -> "docs.example.com/de"
 */
export function normalizeInstanceUrl(url: string): string {
    const trimmed = url.trim();

    // Check if URL has a scheme (case-insensitive)
    const schemeMatch = trimmed.match(/^(https?:\/\/)/i);

    let urlWithoutScheme: string;
    if (schemeMatch) {
        urlWithoutScheme = trimmed.slice(schemeMatch[0].length);
    } else {
        urlWithoutScheme = trimmed;
    }

    // Split into host and path
    const slashIndex = urlWithoutScheme.indexOf("/");
    let host: string;
    let path: string;

    if (slashIndex === -1) {
        host = urlWithoutScheme;
        path = "";
    } else {
        host = urlWithoutScheme.slice(0, slashIndex);
        path = urlWithoutScheme.slice(slashIndex);
    }

    // Lowercase the host (domains are case-insensitive)
    const normalizedHost = host.toLowerCase();

    // Remove trailing slash from path (except for root path "/")
    let normalizedPath = path;
    if (normalizedPath.length > 1 && normalizedPath.endsWith("/")) {
        normalizedPath = normalizedPath.slice(0, -1);
    }

    // Remove query string and hash if present
    const queryIndex = normalizedPath.indexOf("?");
    if (queryIndex !== -1) {
        normalizedPath = normalizedPath.slice(0, queryIndex);
    }
    const hashIndex = normalizedPath.indexOf("#");
    if (hashIndex !== -1) {
        normalizedPath = normalizedPath.slice(0, hashIndex);
    }

    return normalizedHost + normalizedPath;
}
