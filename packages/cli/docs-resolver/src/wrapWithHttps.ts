export function wrapWithHttps(url: string): string {
    return url.startsWith("https://") || url.startsWith("http://") ? url : `https://${url}`;
}
