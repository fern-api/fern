/**
 * Extract the last path segment from a URL.
 * Returns undefined if no path segment is found.
 */
export function extractPathSegment(url: string): string | undefined {
    try {
        const urlObj = new URL(url);
        const pathSegments = urlObj.pathname.split("/").filter((s) => s.length > 0);
        if (pathSegments.length > 0) {
            return pathSegments[pathSegments.length - 1];
        }
    } catch {
        // Invalid URL, return undefined
    }
    return undefined;
}

/**
 * Get the protocol from a URL (e.g., "https", "wss", "http")
 */
export function getProtocol(url: string): string | undefined {
    try {
        const urlObj = new URL(url);
        return urlObj.protocol.replace(":", "");
    } catch {
        return undefined;
    }
}

/**
 * Generate a unique URL ID for a WebSocket server.
 * When grouping by host (usePathOnly=true), prefer just the path segment since it's already scoped by environment.
 * Otherwise, combine server name with path to ensure uniqueness across environments.
 */
export function generateWebsocketUrlId(
    serverName: string | undefined,
    serverUrl: string,
    usePathOnly: boolean = false
): string {
    const urlPathSegment = extractPathSegment(serverUrl);

    // When grouping by host, prefer just the path segment since it's already scoped by environment
    if (usePathOnly && urlPathSegment != null) {
        return urlPathSegment;
    }

    // If we have both server name and path segment, combine them
    if (serverName != null && urlPathSegment != null) {
        return `${serverName}_${urlPathSegment}`;
    }

    // If we only have a path segment, use it alone
    if (urlPathSegment != null) {
        return urlPathSegment;
    }

    // If we only have a server name, use it alone
    if (serverName != null) {
        return serverName;
    }

    // Fallback
    return "websocket";
}
