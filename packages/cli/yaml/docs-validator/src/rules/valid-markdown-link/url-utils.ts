function stripAnchorsAndSearchParams(pathnameWithAnchorsOrSearchParams: string): string {
    return pathnameWithAnchorsOrSearchParams.split(/[?#]/)[0] ?? "";
}

function removeLeadingSlash(pathname: string): string {
    return pathname.startsWith("/") ? pathname.slice(1) : pathname;
}

function addLeadingSlash(pathname: string): string {
    return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function removeTrailingSlash(pathname: string): string {
    return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export { stripAnchorsAndSearchParams, removeLeadingSlash, addLeadingSlash, removeTrailingSlash };
