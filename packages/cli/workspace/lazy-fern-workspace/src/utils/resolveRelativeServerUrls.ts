import { isPlainObject } from "@fern-api/core-utils";

const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:\/\//i;
const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

/** True for a `servers` URL that only means something relative to where the document was loaded from. */
export function isRelativeServerUrl(url: string): boolean {
    return !ABSOLUTE_URL.test(url) && !url.startsWith("{");
}

/**
 * Resolves relative `servers[].url` entries (root, path item and operation level) against the URL the
 * document was loaded from, as the OpenAPI spec defines for relative server URLs. Server variables such
 * as `{version}` are kept as written. Returns a new document and leaves the input unchanged.
 */
export function resolveRelativeServerUrls(document: unknown, documentUrl: string): unknown {
    if (!isPlainObject(document)) {
        return document;
    }
    const paths = isPlainObject(document.paths) ? document.paths : undefined;
    return {
        ...document,
        ...resolveServers(document, documentUrl),
        ...(paths == null
            ? {}
            : {
                  paths: Object.fromEntries(
                      Object.entries(paths).map(([pathName, pathItem]) => [
                          pathName,
                          resolvePathItem(pathItem, documentUrl)
                      ])
                  )
              })
    };
}

function resolvePathItem(pathItem: unknown, documentUrl: string): unknown {
    if (!isPlainObject(pathItem)) {
        return pathItem;
    }
    return {
        ...pathItem,
        ...resolveServers(pathItem, documentUrl),
        ...Object.fromEntries(
            HTTP_METHODS.flatMap((method) => {
                const operation = pathItem[method];
                return isPlainObject(operation)
                    ? [[method, { ...operation, ...resolveServers(operation, documentUrl) }]]
                    : [];
            })
        )
    };
}

function resolveServers(owner: Record<string, unknown>, documentUrl: string): { servers?: unknown[] } {
    const { servers } = owner;
    if (!Array.isArray(servers)) {
        return {};
    }
    return {
        servers: servers.map((server: unknown) =>
            isPlainObject(server) && typeof server.url === "string" && isRelativeServerUrl(server.url)
                ? { ...server, url: resolveAgainst(server.url, documentUrl) }
                : server
        )
    };
}

function resolveAgainst(url: string, documentUrl: string): string {
    try {
        // `new URL` percent-encodes server variable braces, which must stay readable.
        return new URL(url, documentUrl).toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
    } catch {
        // An unresolvable entry is left as written; the generator reports it.
        return url;
    }
}
