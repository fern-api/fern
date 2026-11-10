/**
 * docs.yml `remote-paths`: path prefixes on a docs site that the docs-router Worker
 * reverse-proxies to another HTTPS service. Mirrors `@fern-api/fdr-sdk` `docs/remote-paths.ts`,
 * which FDR enforces on publish; the Worker re-checks at request time.
 */

export interface RemotePathEntry {
    path: string;
    destination: string;
}

export const MAX_REMOTE_PATHS = 20;
export const MAX_REMOTE_PATH_LENGTH = 256;

/** Fern-owned paths (relative to the site's basepath) a remote path may not equal, sit under, or cover. */
export const RESERVED_REMOTE_PATH_PREFIXES: readonly string[] = [
    "/api/fern-docs",
    "/_fern-files",
    "/_fern-img",
    "/_fern-mdx",
    "/_astro",
    "/_shared",
    "/_mcp",
    "/_print",
    "/~login",
    "/.well-known",
    "/fern-nav",
    "/mcp",
    "/robots.txt",
    "/sitemap.xml",
    "/llms.txt",
    "/llms-full.txt",
    "/context7.json",
    "/favicon.ico",
    "/_redirects",
    "/_redirects-fallback.json",
    "/_remote-paths.json",
    "/_headers",
    "/_routes.json"
];

/** Host suffixes Fern serves or owns; a Worker fetch to them skips Worker routes or loops. */
export const FERN_SERVED_HOST_SUFFIXES: readonly string[] = ["buildwithfern.com", "ferndocs.com"];

const PATH_RE = /^(\/[A-Za-z0-9._~-]+)+$/;
const BLOCKED_HOST_SUFFIXES = [".local", ".localhost", ".internal", ".arpa", ".home", ".lan", ".corp"];

/** Whether `a` equals `b` or is a path-segment descendant of it. */
export function isPathAtOrUnder(a: string, b: string): boolean {
    return a === b || a.startsWith(`${b}/`);
}

/** Whether two path prefixes overlap: one equals or contains the other. */
export function pathsOverlap(a: string, b: string): boolean {
    return isPathAtOrUnder(a, b) || isPathAtOrUnder(b, a);
}

function isIpLiteral(hostname: string): boolean {
    // `URL` already canonicalizes IPv4 shorthand/octal/hex (`127.1`, `0177.0.0.1`) to dotted-quad;
    // also reject any host whose last label is numeric or hex, as resolvers may treat it as IPv4.
    const lastLabel = hostname.split(".").pop() ?? "";
    return (
        /^[0-9.]+$/.test(hostname) ||
        /^(0x[0-9a-f]*|[0-9]+)$/i.test(lastLabel) ||
        hostname.includes(":") ||
        hostname.startsWith("[")
    );
}

function hostMatchesSuffix(hostname: string, suffix: string): boolean {
    return hostname === suffix || hostname.endsWith(`.${suffix}`);
}

/** Problems with a remote-path `path`; empty when valid. */
export function remotePathPathProblems(path: string): string[] {
    if (path.length > MAX_REMOTE_PATH_LENGTH) {
        return [`path "${path.slice(0, 32)}…" must be at most ${MAX_REMOTE_PATH_LENGTH} characters`];
    }
    if (!PATH_RE.test(path)) {
        return [
            `path "${path}" must start with "/", contain only letters, digits and "._~-" segments, and not end with "/"`
        ];
    }
    if (path.split("/").some((segment) => segment === "." || segment === "..")) {
        return [`path "${path}" must not contain "." or ".." segments`];
    }
    // Case-insensitive so `/API/fern-docs` cannot slip past a case-insensitive route match.
    const lowerPath = path.toLowerCase();
    const reserved = RESERVED_REMOTE_PATH_PREFIXES.find((prefix) => pathsOverlap(lowerPath, prefix.toLowerCase()));
    if (reserved != null) {
        return [`path "${path}" overlaps the Fern-reserved path "${reserved}"`];
    }
    return [];
}

/**
 * Problems with a remote-path `destination`; empty when valid. `ownHosts` are the
 * site's own hostnames (instance URLs and custom domains), which may not be targets.
 */
export function remotePathDestinationProblems(destination: string, ownHosts: readonly string[] = []): string[] {
    let url: URL;
    try {
        url = new URL(destination);
    } catch {
        return [`destination "${destination}" must be an absolute https:// URL`];
    }
    if (url.protocol !== "https:") {
        return [`destination "${destination}" must use https://`];
    }
    if (url.username !== "" || url.password !== "") {
        return [`destination "${destination}" must not contain credentials`];
    }
    if (url.search !== "" || url.hash !== "" || destination.includes("?") || destination.includes("#")) {
        return [`destination "${destination}" must not contain a query string or fragment`];
    }
    if (url.port !== "") {
        return [`destination "${destination}" must use the default https port`];
    }
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (isIpLiteral(hostname)) {
        return [`destination "${destination}" must use a hostname, not an IP address`];
    }
    if (
        !hostname.includes(".") ||
        hostname === "localhost" ||
        BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
    ) {
        return [`destination "${destination}" must be a public hostname`];
    }
    if (FERN_SERVED_HOST_SUFFIXES.some((suffix) => hostMatchesSuffix(hostname, suffix))) {
        return [`destination "${destination}" must not be a Fern-hosted domain`];
    }
    const own = ownHosts.map((host) => host.toLowerCase().replace(/:\d+$/, "").replace(/\.$/, ""));
    if (own.includes(hostname)) {
        return [`destination "${destination}" must not be this docs site's own domain`];
    }
    return [];
}

/** Every problem with a list of remote paths, including duplicate and nested mounts. */
export function remotePathProblems(entries: readonly RemotePathEntry[], ownHosts: readonly string[] = []): string[] {
    const problems: string[] = [];
    if (entries.length > MAX_REMOTE_PATHS) {
        problems.push(`at most ${MAX_REMOTE_PATHS} remote paths are allowed (found ${entries.length})`);
    }
    entries.forEach((entry, index) => {
        problems.push(...remotePathPathProblems(entry.path));
        problems.push(...remotePathDestinationProblems(entry.destination, ownHosts));
        for (const other of entries.slice(0, index)) {
            if (pathsOverlap(entry.path, other.path)) {
                problems.push(`path "${entry.path}" overlaps the remote path "${other.path}"`);
            }
        }
    });
    return problems;
}
