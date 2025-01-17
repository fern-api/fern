export function removeTrailingSlash(str: string): string {
    return str.endsWith("/") ? str.substring(0, str.length - 1) : str;
}

export function removeLeadingSlash(str: string): string {
    return str.startsWith("/") ? str.substring(1) : str;
}

export function normalizePath(str: string): string {
    return removeTrailingSlash(removeLeadingSlash(str));
}
