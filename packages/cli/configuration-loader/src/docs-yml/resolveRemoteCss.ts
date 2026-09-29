import { CliError } from "@fern-api/task-context";

const MAX_IMPORT_DEPTH = 10;

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

    const css = await fetchCss(url);

    const imports: { statement: string; href: string; condition: string }[] = [];
    for (const match of css.matchAll(IMPORT_REGEX)) {
        const href = match[2] ?? match[4];
        if (href == null) {
            continue;
        }
        imports.push({
            statement: match[0],
            href: new URL(href.trim(), url).toString(),
            condition: match[5]?.trim() ?? ""
        });
    }

    let resolved = css;
    for (const { statement, href, condition } of imports) {
        const canInline = condition === "" || !/^(layer|supports)\b/i.test(condition);
        const replacement = canInline
            ? wrapInMedia(await resolveRemoteCssRecursive(href, visited, depth + 1), condition)
            : `@import url("${href}") ${condition};`;
        resolved = resolved.replace(statement, () => replacement);
    }

    return absolutizeUrls(resolved, url);
}

async function fetchCss(url: string): Promise<string> {
    let response: Response;
    try {
        response = await fetch(url);
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
