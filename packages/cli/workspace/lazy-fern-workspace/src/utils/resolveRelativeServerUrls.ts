import { isPlainObject } from "@fern-api/core-utils";

const ABSOLUTE_URL = /^[a-z][a-z0-9+.-]*:\/\//i;
// A variable that stands for the scheme, with no default to look at.
const LEADING_VARIABLE_SCHEME = /^\{[^}]+\}:\/\//;
const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

/**
 * True for a `servers` URL that only means something relative to where the document was loaded from.
 * Server variables are replaced by their defaults first, so `{scheme}://api.example.com` and a variable
 * whose default is a full address are absolute, while `{stage}/api` is relative.
 */
export function isRelativeServerUrl(url: string, variables?: unknown): boolean {
    const expanded = url.replace(/\{([^}]+)\}/g, (placeholder, name: string) => {
        const variable = isPlainObject(variables) ? variables[name] : undefined;
        return isPlainObject(variable) && typeof variable.default === "string" ? variable.default : placeholder;
    });
    return !ABSOLUTE_URL.test(expanded) && !LEADING_VARIABLE_SCHEME.test(expanded);
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
            isPlainObject(server) && typeof server.url === "string" && isRelativeServerUrl(server.url, server.variables)
                ? { ...server, url: resolveAgainst(server.url, documentUrl) }
                : server
        )
    };
}

function resolveAgainst(url: string, documentUrl: string): string {
    try {
        // `new URL` percent-encodes server variable braces, which must stay readable.
        const resolved = new URL(url, documentUrl).toString().replace(/%7B/gi, "{").replace(/%7D/gi, "}");
        // OpenAPI server URLs must not end with a slash, so do not add one the spec did not have.
        return resolved.endsWith("/") && !url.endsWith("/") ? resolved.slice(0, -1) : resolved;
    } catch {
        // An unresolvable entry is left as written; the generator reports it.
        return url;
    }
}
