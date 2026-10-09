export interface NotificationUrlCandidatesOptions {
    /**
     * Try the URL both with the scheme's standard port added (`:443` for https, `:80`
     * for http) if absent, and with any port removed.
     */
    portVariants: boolean;
    /**
     * Additionally try each port variant with the query string re-encoded using legacy
     * form-encoding, reversing percent-encoding differences introduced by WHATWG URL parsing.
     */
    legacyQueryEncoding: boolean;
}

/**
 * Build the list of normalized notification-URL forms to verify a webhook signature
 * against. Some providers (e.g. Twilio) are inconsistent about whether the URL they
 * signed carried a port and how its query string was encoded, so a signature is
 * accepted if it matches the computation over ANY of these candidates.
 *
 * Mirrors twilio-node's `addPort` / `removePort` / `buildUrlWithStandardPort` /
 * `withLegacyQuerystring`. Always includes at least the caller-supplied URL and never
 * throws: an unparseable URL yields `[url]`.
 */
export function notificationUrlCandidates(url: string, options: NotificationUrlCandidatesOptions): string[] {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        return [url];
    }

    const portForms = options.portVariants ? [removePort(url), addPort(parsed)] : [url];

    // A Set preserves insertion order while collapsing forms that coincide (e.g. a URL
    // that already carries a standard port, or a query-less URL under legacy encoding).
    const candidates = new Set<string>([url, ...portForms]);
    if (options.legacyQueryEncoding) {
        for (const form of portForms) {
            candidates.add(withLegacyQuerystring(form));
        }
    }
    return Array.from(candidates);
}

function buildUrlWithStandardPort(parsedUrl: URL): string {
    let url = "";
    const port = parsedUrl.protocol === "https:" ? ":443" : ":80";
    url += parsedUrl.protocol ? `${parsedUrl.protocol}//` : "";
    url += parsedUrl.username;
    url += parsedUrl.password ? `:${parsedUrl.password}` : "";
    url += parsedUrl.username || parsedUrl.password ? "@" : "";
    url += parsedUrl.host ? parsedUrl.host + port : "";
    url += parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
    return url;
}

function addPort(parsedUrl: URL): string {
    if (!parsedUrl.port) {
        return buildUrlWithStandardPort(parsedUrl);
    }
    return parsedUrl.toString();
}

function removePort(url: string): string {
    const copy = new URL(url); // operate on a copy so the caller's URL is not mutated
    copy.port = "";
    return copy.toString();
}

function withLegacyQuerystring(url: string): string {
    const parsedUrl = new URL(url);
    if (parsedUrl.search) {
        // URLSearchParams reproduces legacy form-encoding without node-only `querystring`,
        // so this runs unchanged in browser and edge runtimes.
        const params = new URLSearchParams(parsedUrl.search);
        parsedUrl.search = "";
        return `${parsedUrl.toString()}?${params.toString()}`;
    }
    return url;
}
