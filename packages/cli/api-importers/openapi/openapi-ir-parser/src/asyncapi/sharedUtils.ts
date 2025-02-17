export function transformToValidPath(path: string): string {
    if (!path.startsWith("/")) {
        return "/" + path;
    }
    return path;
}
