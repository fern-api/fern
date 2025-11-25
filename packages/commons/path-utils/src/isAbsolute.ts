export function isAbsolute(value: string): boolean {
    // Check for Unix absolute paths (/path) and Windows absolute paths (C:\path or C:/path)
    return value.startsWith("/") || /^[a-zA-Z]:[\\/]/.test(value);
}
