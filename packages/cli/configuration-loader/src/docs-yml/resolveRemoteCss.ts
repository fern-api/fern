import { CliError } from "@fern-api/task-context";

const MAX_IMPORT_DEPTH = 10;
const FETCH_TIMEOUT_MS = 30_000;

const COMMENT_REGEX = /\/\*[\s\S]*?\*\//g;
const IMPORT_REGEX = /@import\s+(?:url\(\s*(['"]?)([^'")]+)\1\s*\)|(['"])([^'"]+)\3)\s*([^;]*);/g;
const URL_REGEX = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

export function isRemoteCssUrl(value: string): boolean {
    return /^https?:\/\//i.test(value.trim());
}

/**
 * Fetches a remote stylesheet and returns CSS that can be inlined into the docs site.
 *
 * Custom CSS is concatenated after Fern's own styles, where `@import` rules are ignored by browsers,
 * so nested imports are fetched and inlined recursively (wrapped in `@layer`/`@supports`/`@media` blocks
 * to preserve their conditions). Relative `url(...)` references are rewritten to absolute URLs so fonts
 * and images keep resolving against the host that served each stylesheet.
 */
export async function resolveRemoteCss(url: string): Promise<string> {
    return resolveRemoteCssRecursive(url.trim(), new Set(), 0);
}

async function resolveRemoteCssRecursive(url: string, visited: Set<string>, depth: number): Promise<string> {
    if (visited.has(url) || depth > MAX_IMPORT_DEPTH) {
        return "";
    }
    visited.add(url);

    const { text, finalUrl } = await fetchCss(url);
    visited.add(finalUrl);
    const css = absolutizeUrls(text.replace(COMMENT_REGEX, ""), finalUrl);

    let resolved = "";
    let lastIndex = 0;
    for (const match of css.matchAll(IMPORT_REGEX)) {
        const href = match[2] ?? match[4];
        if (href == null) {
            continue;
        }
        const absoluteHref = resolveUrl(href.trim(), finalUrl);
        const replacement = isRemoteCssUrl(absoluteHref)
            ? wrapInConditions(
                  await resolveRemoteCssRecursive(absoluteHref, visited, depth + 1),
                  parseImportConditions(match[5]?.trim() ?? "")
              )
            : "";
        resolved += css.slice(lastIndex, match.index) + replacement;
        lastIndex = match.index + match[0].length;
    }
    return resolved + css.slice(lastIndex);
}

interface ImportConditions {
    layer: string | undefined;
    supports: string | undefined;
    media: string;
}

function parseImportConditions(condition: string): ImportConditions {
    let rest = condition;
    let layer: string | undefined;
    let supports: string | undefined;

    const layerMatch = /^layer\b/i.exec(rest);
    if (layerMatch != null) {
        rest = rest.slice(layerMatch[0].length);
        if (rest.startsWith("(")) {
            const [arg, remaining] = takeParenthesized(rest);
            layer = arg.trim();
            rest = remaining;
        } else {
            layer = "";
        }
        rest = rest.trim();
    }

    const supportsMatch = /^supports(?=\()/i.exec(rest);
    if (supportsMatch != null) {
        const [arg, remaining] = takeParenthesized(rest.slice(supportsMatch[0].length));
        supports = arg.trim();
        rest = remaining.trim();
    }

    return { layer, supports, media: rest };
}

/** Given a string starting with "(", returns the balanced parenthesized contents and the remainder. */
function takeParenthesized(value: string): [string, string] {
    let depth = 0;
    for (let i = 0; i < value.length; i++) {
        if (value[i] === "(") {
            depth++;
        } else if (value[i] === ")") {
            depth--;
            if (depth === 0) {
                return [value.slice(1, i), value.slice(i + 1)];
            }
        }
    }
    return [value.slice(1), ""];
}

function wrapInConditions(css: string, { layer, supports, media }: ImportConditions): string {
    let wrapped = css;
    if (layer != null) {
        wrapped = `@layer${layer === "" ? "" : ` ${layer}`} {\n${wrapped}\n}`;
    }
    if (supports != null) {
        const supportsCondition = /^\(.*\)$/s.test(supports) ? supports : `(${supports})`;
        wrapped = `@supports ${supportsCondition} {\n${wrapped}\n}`;
    }
    if (media !== "") {
        wrapped = `@media ${media} {\n${wrapped}\n}`;
    }
    return wrapped;
}

function resolveUrl(href: string, baseUrl: string): string {
    try {
        return new URL(href, baseUrl).toString();
    } catch {
        throw new CliError({
            message: `Invalid @import URL "${href}" in CSS from ${redactUrl(baseUrl)}`,
            code: CliError.Code.ConfigError
        });
    }
}

async function fetchCss(url: string): Promise<{ text: string; finalUrl: string }> {
    let response: Response;
    try {
        response = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch (error) {
        throw new CliError({
            message: `Failed to fetch CSS from ${redactUrl(url)}: ${error instanceof Error ? error.message : String(error)}`,
            code: CliError.Code.NetworkError
        });
    }
    if (!response.ok) {
        throw new CliError({
            message: `Failed to fetch CSS from ${redactUrl(url)}: ${response.status} ${response.statusText}`,
            code: CliError.Code.NetworkError
        });
    }
    return { text: await response.text(), finalUrl: response.url !== "" ? response.url : url };
}

/** Drops the query string and fragment, which may carry signing tokens. */
function redactUrl(url: string): string {
    try {
        const parsed = new URL(url);
        return `${parsed.origin}${parsed.pathname}`;
    } catch {
        return url;
    }
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
