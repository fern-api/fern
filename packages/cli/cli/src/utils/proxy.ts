import { Agent, Dispatcher, ProxyAgent } from "undici";

export interface ProxyEnvironment {
    httpProxy: string | undefined;
    httpsProxy: string | undefined;
    noProxy: string | undefined;
}

const DEFAULT_PORTS: Record<string, number> = { "http:": 80, "https:": 443 };

/**
 * Reads the conventional proxy variables (as curl, npm and pip do), accepting both
 * lower- and upper-case spellings.
 */
export function readProxyEnvironment(env: NodeJS.ProcessEnv = process.env): ProxyEnvironment {
    return {
        httpProxy: firstNonEmpty(env, ["http_proxy", "HTTP_PROXY"]),
        httpsProxy: firstNonEmpty(env, ["https_proxy", "HTTPS_PROXY"]),
        noProxy: firstNonEmpty(env, ["no_proxy", "NO_PROXY"])
    };
}

/**
 * Returns the proxy to use for a request to `origin`, or undefined to connect directly.
 * HTTPS origins use `https_proxy` (falling back to `http_proxy`), HTTP origins use
 * `http_proxy`. Loopback addresses and `no_proxy` matches are never proxied.
 */
export function getProxyUriForOrigin(origin: string | URL, proxyEnvironment: ProxyEnvironment): string | undefined {
    const url = typeof origin === "string" ? new URL(origin) : origin;
    const hostname = url.hostname.toLowerCase();
    const port = Number.parseInt(url.port, 10) || DEFAULT_PORTS[url.protocol] || 0;
    if (isLoopback(hostname) || matchesNoProxy({ hostname, port, noProxy: proxyEnvironment.noProxy })) {
        return undefined;
    }
    if (url.protocol === "https:") {
        return proxyEnvironment.httpsProxy ?? proxyEnvironment.httpProxy;
    }
    return proxyEnvironment.httpProxy;
}

/**
 * Routes each request through the proxy configured for its origin (if any), re-reading
 * the environment on every request. Node's global `fetch` does not look at proxy
 * variables on its own, so this is installed with `setGlobalDispatcher`.
 */
export function createEnvironmentProxyDispatcher(options: Agent.Options = {}): Dispatcher {
    const proxyAgents = new Map<string, ProxyAgent>();
    const getProxyAgent = (proxyUri: string): ProxyAgent => {
        let agent = proxyAgents.get(proxyUri);
        if (agent == null) {
            agent = new ProxyAgent({ ...options, uri: proxyUri });
            proxyAgents.set(proxyUri, agent);
        }
        return agent;
    };
    return new Agent(options).compose((dispatch) => (dispatchOptions, handler) => {
        const proxyUri =
            dispatchOptions.origin != null
                ? getProxyUriForOrigin(dispatchOptions.origin, readProxyEnvironment())
                : undefined;
        return proxyUri != null
            ? getProxyAgent(proxyUri).dispatch(dispatchOptions, handler)
            : dispatch(dispatchOptions, handler);
    });
}

function firstNonEmpty(env: NodeJS.ProcessEnv, names: string[]): string | undefined {
    for (const name of names) {
        const value = env[name];
        if (value != null && value !== "") {
            return value;
        }
    }
    return undefined;
}

function isLoopback(hostname: string): boolean {
    return (
        hostname === "localhost" ||
        hostname.endsWith(".localhost") ||
        hostname.startsWith("127.") ||
        hostname === "[::1]" ||
        hostname === "::1"
    );
}

function matchesNoProxy({
    hostname,
    port,
    noProxy
}: {
    hostname: string;
    port: number;
    noProxy: string | undefined;
}): boolean {
    if (noProxy == null) {
        return false;
    }
    if (noProxy.trim() === "*") {
        return true;
    }
    for (const rawEntry of noProxy.split(/[,\s]+/)) {
        if (rawEntry === "") {
            continue;
        }
        const match = rawEntry.match(/^(.+):(\d+)$/);
        const entryHost = (match?.[1] ?? rawEntry).toLowerCase();
        const entryPort = match?.[2] != null ? Number.parseInt(match[2], 10) : undefined;
        if (entryPort != null && entryPort !== port) {
            continue;
        }
        if (entryHost.startsWith(".") || entryHost.startsWith("*")) {
            if (hostname.endsWith(entryHost.replace(/^\*/, ""))) {
                return true;
            }
        } else if (hostname === entryHost || hostname.endsWith(`.${entryHost}`)) {
            return true;
        }
    }
    return false;
}
