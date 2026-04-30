/**
 * Returns the pathname with the site's basePath prepended, or null if prepending
 * would not change the path (no basePath configured, or the pathname already
 * starts with the basePath).
 *
 * Page slugs collected by the docs resolver always include the site's basePath
 * (e.g. a page at `/docs/about` is stored as `docs/about`). Authors, however,
 * commonly write absolute links as site-relative paths without the basePath
 * (e.g. `/about` or `/v2/guide`). Link validation uses this helper to also
 * check the basePath-prefixed form so both conventions resolve.
 */
export function withBasePathPrepended(pathname: string, basePath: string | undefined): string | null {
    if (basePath == null) {
        return null;
    }
    const basePathSlug = stripSlashes(basePath);
    if (basePathSlug === "") {
        return null;
    }
    const bare = stripLeadingSlash(pathname);
    if (bare === basePathSlug || bare.startsWith(basePathSlug + "/")) {
        return null;
    }
    return `${basePathSlug}/${bare}`;
}

function stripLeadingSlash(value: string): string {
    return value.startsWith("/") ? value.slice(1) : value;
}

function stripTrailingSlash(value: string): string {
    return value.endsWith("/") ? value.slice(0, -1) : value;
}

function stripSlashes(value: string): string {
    return stripLeadingSlash(stripTrailingSlash(value));
}
