import { anySignal, getTimeoutSignal } from "./signals";

const MAX_REDIRECTS = 20;
const REDIRECT_STATUS_CODES = new Set([301, 302, 303, 307, 308]);

function getUrlOrigin(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.protocol}//${parsed.hostname}:${parsed.port || (parsed.protocol === "https:" ? "443" : "80")}`;
    } catch {
        return url;
    }
}

function isSameOrigin(url1: string, url2: string): boolean {
    return getUrlOrigin(url1) === getUrlOrigin(url2);
}

function resolveRedirectUrl(requestUrl: string, location: string): string {
    try {
        return new URL(location, requestUrl).toString();
    } catch {
        return location;
    }
}

/**
 * Cached result of checking whether the current runtime supports
 * the `cache` option in `Request`. Some runtimes (e.g. Cloudflare Workers)
 * throw a TypeError when this option is used.
 */
let _cacheNoStoreSupported: boolean | undefined;
export function isCacheNoStoreSupported(): boolean {
    if (_cacheNoStoreSupported != null) {
        return _cacheNoStoreSupported;
    }
    try {
        new Request("http://localhost", { cache: "no-store" });
        _cacheNoStoreSupported = true;
    } catch {
        _cacheNoStoreSupported = false;
    }
    return _cacheNoStoreSupported;
}

/**
 * Reset the cached result of `isCacheNoStoreSupported`. Exposed for testing only.
 */
export function resetCacheNoStoreSupported(): void {
    _cacheNoStoreSupported = undefined;
}

export const makeRequest = async (
    fetchFn: (url: string, init: RequestInit) => Promise<Response>,
    url: string,
    method: string,
    headers: Headers | Record<string, string>,
    requestBody: BodyInit | undefined,
    timeoutMs?: number,
    abortSignal?: AbortSignal,
    withCredentials?: boolean,
    duplex?: "half",
    disableCache?: boolean,
    authHeaderKeysToStrip?: Set<string>,
): Promise<Response> => {
    const signals: AbortSignal[] = [];

    let timeoutAbortId: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs != null) {
        const { signal, abortId } = getTimeoutSignal(timeoutMs);
        timeoutAbortId = abortId;
        signals.push(signal);
    }

    if (abortSignal != null) {
        signals.push(abortSignal);
    }
    const newSignals = anySignal(signals);
    const cacheOption = disableCache && isCacheNoStoreSupported() ? { cache: "no-store" as RequestCache } : {};

    let currentUrl = url;
    let currentMethod = method;
    let currentHeaders = headers;
    let currentBody = requestBody;
    let redirectCount = 0;

    let response = await fetchFn(currentUrl, {
        method: currentMethod,
        headers: currentHeaders,
        body: currentBody,
        signal: newSignals,
        credentials: withCredentials ? "include" : undefined,
        redirect: "manual",
        // @ts-ignore
        duplex,
        ...cacheOption,
    });

    while (REDIRECT_STATUS_CODES.has(response.status) && redirectCount < MAX_REDIRECTS) {
        const location = response.headers.get("location");
        if (location == null) {
            break;
        }

        const redirectUrl = resolveRedirectUrl(currentUrl, location);
        redirectCount++;

        // 301, 302, 303: switch to GET and drop body
        if ([301, 302, 303].includes(response.status)) {
            currentMethod = "GET";
            currentBody = undefined;
        }

        // Strip auth headers on cross-origin redirects
        if (!isSameOrigin(currentUrl, redirectUrl) && authHeaderKeysToStrip != null && authHeaderKeysToStrip.size > 0) {
            const newHeaders = new Headers();
            const entries = currentHeaders instanceof Headers ? currentHeaders.entries() : Object.entries(currentHeaders);
            for (const [key, value] of entries) {
                if (!authHeaderKeysToStrip.has(key.toLowerCase())) {
                    newHeaders.set(key, value);
                }
            }
            currentHeaders = newHeaders;
        }

        currentUrl = redirectUrl;

        response = await fetchFn(currentUrl, {
            method: currentMethod,
            headers: currentHeaders,
            body: currentBody,
            signal: newSignals,
            credentials: withCredentials ? "include" : undefined,
            redirect: "manual",
            // @ts-ignore
            duplex,
            ...cacheOption,
        });
    }

    if (timeoutAbortId != null) {
        clearTimeout(timeoutAbortId);
    }

    return response;
};
