<% if (tcpKeepalive && tcpKeepalive.enabled) { %>
import { RUNTIME } from "../runtime/index";

/**
 * Cached, Node-only fetch wrapper that routes requests through an undici dispatcher configured
 * with TCP keepalive, so long, non-streaming requests survive idle-connection reaping by a
 * firewall / load balancer / NAT. Resolves to `null` on non-Node runtimes (which can't set socket
 * options) or when `undici` cannot be loaded, in which case the caller falls back to plain fetch.
 */
const KEEPALIVE_INITIAL_DELAY_MS = <%= (tcpKeepalive.idleSeconds != null ? tcpKeepalive.idleSeconds : 60) * 1000 %>;
let _keepaliveFetch: typeof fetch | null | undefined;

async function getKeepaliveFetch(): Promise<typeof fetch | null> {
    if (_keepaliveFetch !== undefined) {
        return _keepaliveFetch;
    }
    if (RUNTIME.type !== "node") {
        _keepaliveFetch = null;
        return _keepaliveFetch;
    }
    try {
        const { Agent } = await import("undici");
        const dispatcher = new Agent({
            connect: { keepAlive: true, keepAliveInitialDelay: KEEPALIVE_INITIAL_DELAY_MS },
        });
        _keepaliveFetch = ((input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]): Promise<Response> =>
            // @ts-ignore undici-specific `dispatcher` init option (Node's global fetch is undici under the hood)
            fetch(input, { ...init, dispatcher })) as typeof fetch;
    } catch {
        // `undici` isn't available in this environment; keepalive simply isn't applied.
        _keepaliveFetch = null;
    }
    return _keepaliveFetch;
}
<% } %>
<% if (fetchSupport === "node-fetch") { %>
<% if (!(tcpKeepalive && tcpKeepalive.enabled)) { %>
import { RUNTIME } from "../runtime/index";
<% } %>

/**
 * Returns a fetch function based on the runtime
 */
export async function getFetchFn(): Promise<any> {
    // In Node.js 18+ environments, use native fetch
    if (RUNTIME.type === "node" && RUNTIME.parsedVersion != null && RUNTIME.parsedVersion >= 18) {
<% if (tcpKeepalive && tcpKeepalive.enabled) { %>
        const keepaliveFetch = await getKeepaliveFetch();
        if (keepaliveFetch != null) {
            return keepaliveFetch;
        }
<% } %>
        return fetch;
    }

    // In Node.js 18 or lower environments, the SDK always uses`node-fetch`.
    if (RUNTIME.type === "node") {
        return (await import("node-fetch")).default as any;
    }

    // Otherwise the SDK uses global fetch if available,
    // and falls back to node-fetch.
    if (typeof fetch === "function") {
        return fetch;
    }

    // Defaults to node `node-fetch` if global fetch isn't available
    return (await import("node-fetch")).default as any;
}
<% } else { %>
export async function getFetchFn(): Promise<typeof fetch> {
<% if (tcpKeepalive && tcpKeepalive.enabled) { %>
    const keepaliveFetch = await getKeepaliveFetch();
    if (keepaliveFetch != null) {
        return keepaliveFetch;
    }
<% } %>
    return fetch;
}
<% } %>
