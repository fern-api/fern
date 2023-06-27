export function getSlugFromUrl({ pathname, basePath }: { pathname: string; basePath: string | undefined }): string {
    const slug = basePath != null ? pathname.replace(new RegExp(`^${basePath}`), "") : pathname;
    return removeLeadingAndTrailingSlashes(slug);
}

function removeLeadingAndTrailingSlashes(s: string): string {
    if (s.startsWith("/")) {
        s = s.substring(1);
    }
    if (s.endsWith("/")) {
        s = s.substring(0, s.length - 1);
    }
    return s;
}
