import { CliError } from "@fern-api/task-context";

const MAX_IMPORT_DEPTH = 10;
const FETCH_TIMEOUT_MS = 30_000;

const IMPORT_REGEX = /@import\s+(?:url\(\s*(['"]?)([^'")]+)\1\s*\)|(['"])([^'"]+)\3)\s*([^;]*);/g;
const URL_REGEX = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

export function isRemoteCssUrl(value: string): boolean {
    return /^https?:\/\//i.test(value.trim());
}

/**
 * Fetches a remote stylesheet and returns CSS that can be inlined into the docs site.
 *
 * Custom CSS is concatenated after Fern's own styles, where `@import` rules are ignored by browsers,
 * so nested imports are fetched and inlined recursively. Relative `url(...)` references are rewritten
 * to absolute URLs so fonts and images keep resolving against the original host.
 */
export async function resolveRemoteCss(url: string): Promise<string> {
    return resolveRemoteCssRecursive(url.trim(), new Set(), 0);
}

async function resolveRemoteCssRecursive(url: string, visited: Set<string>, depth: number): Promise<string> {
    if (visited.has(url) || depth > MAX_IMPORT_DEPTH) {
        return "";
    }
    visited.add(url);

    const css = absolutizeUrls(await fetchCss(url), url);

    let resolved = "";
    let lastIndex = 0;
    for (const match of css.matchAll(IMPORT_REGEX)) {
        const href = match[2] ?? match[4];
        if (href == null) {
            continue;
        }
        const condition = match[5]?.trim() ?? "";
        const absoluteHref = resolveUrl(href.trim(), url);
        const replacement = /^(layer|supports)\b/i.test(condition)
            ? `@import url("${absoluteHref}") ${condition};`
            : wrapInMedia(await resolveRemoteCssRecursive(absoluteHref, visited, depth + 1), condition);
        resolved += css.slice(lastIndex, match.index) + replacement;
        lastIndex = match.index + match[0].length;
    }
    return resolved + css.slice(lastIndex);
}

function resolveUrl(href: string, baseUrl: string): string {
    try {
        return new URL(href, baseUrl).toString();
    } catch {
        throw new CliError({
            message: `Invalid @import URL "${href}" in CSS from ${baseUrl}`,
            code: CliError.Code.ConfigError
        });
    }
}

async function fetchCss(url: string): Promise<string> {
    let response: Response;
    try {
        response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch (error) {
        throw new CliError({
            message: `Failed to fetch CSS from ${url}: ${error instanceof Error ? error.message : String(error)}`,
            code: CliError.Code.NetworkError
        });
    }
    if (!response.ok) {
        throw new CliError({
            message: `Failed to fetch CSS from ${url}: ${response.status} ${response.statusText}`,
            code: CliError.Code.NetworkError
        });
    }
    return response.text();
}

function wrapInMedia(css: string, condition: string): string {
    return condition === "" ? css : `@media ${condition} {\n${css}\n}`;
}

function absolutizeUrls(css: string, baseUrl: string): string {
    return css.replace(URL_REGEX, (match, quote: string, href: string) => {
        const trimmed = href.trim();
        if (/^(data:|#|[a-z][a-z0-9+.-]*:)/i.test(trimmed)) {
            return match;
        }
        try {
            return `url(${quote}${new URL(trimmed, baseUrl).toString()}${quote})`;
        } catch {
            return match;
        }
    });
}
