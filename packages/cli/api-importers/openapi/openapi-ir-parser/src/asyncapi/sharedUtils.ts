export function constructServerUrl(protocol: string, url: string): string {
    if (url.includes("://")) {
        return url;
    }
    return `${protocol}://${url}`;
}

export function transformToValidPath(path: string): string {
    if (!path.startsWith("/")) {
        return "/" + path;
    }
    return path;
}
