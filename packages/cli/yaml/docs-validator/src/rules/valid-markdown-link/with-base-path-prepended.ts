import { removeLeadingSlash, removeTrailingSlash } from "@fern-api/core-utils";
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
    const bare = removeLeadingSlash(pathname);
    if (bare === basePathSlug || bare.startsWith(basePathSlug + "/")) {
        return null;
    }
    return `${basePathSlug}/${bare}`;
}

function stripSlashes(value: string): string {
    return removeLeadingSlash(removeTrailingSlash(value));
}
