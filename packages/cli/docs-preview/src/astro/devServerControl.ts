/**
 * Local control routes on the `fern docs dev` proxy, used by `fern docs dev stop`:
 *
 * - `GET /__fern/dev-server` identifies the server, so `stop` can tell a `fern docs dev` server apart from
 *   whatever else might be listening on the port.
 * - `POST /__fern/shutdown` stops it cleanly, the same way SIGTERM does.
 *
 * The routes only exist in the CLI's own proxy, which is never deployed, and they have no token. Instead, every
 * request must:
 * - come from this machine (the proxy listens on all interfaces, so other devices on the network can reach it);
 * - carry the `x-fern-docs-dev: 1` header, which a cross-site page can only send after a CORS preflight that the
 *   proxy never approves;
 * - use a loopback `Host`, and a same-server `Origin` if one is sent, which blocks DNS rebinding.
 */
export const DOCS_DEV_SERVER_INFO_PATH = "/__fern/dev-server";
export const DOCS_DEV_SHUTDOWN_PATH = "/__fern/shutdown";
export const DOCS_DEV_CONTROL_HEADER = "x-fern-docs-dev";
export const DOCS_DEV_CONTROL_HEADER_VALUE = "1";

/**
 * The ways to stop a running `fern docs dev`, printed once it is ready and included in the `--json` ready event,
 * so an agent can stop the server without having to find its process.
 */
export interface DocsDevStopInstructions {
    /** Key to press in the terminal running the server. */
    keys: "Ctrl-C";
    /** Command that stops this server from another terminal. */
    command: string;
    /** Command that sends SIGTERM to this server's process, which also stops it cleanly. */
    kill: string;
}

export function getDocsDevStopInstructions({
    cliName,
    port,
    pid
}: {
    cliName: string;
    port: number;
    pid: number;
}): DocsDevStopInstructions {
    return { keys: "Ctrl-C", command: `${cliName} docs dev stop --port ${port}`, kill: `kill ${pid}` };
}

export function formatDocsDevStopInstructions({ keys, command, kill }: DocsDevStopInstructions): string {
    return `To stop the server, press ${keys}, run \`${command}\`, or run \`${kill}\`.`;
}

/** Body of `GET /__fern/dev-server`. */
export interface DocsDevServerInfo {
    fernDocsDev: true;
    pid: number;
    port: number;
    backendPort: number;
    url: string;
    fernDirectory: string;
}

const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function isDocsDevServerInfo(value: unknown): value is DocsDevServerInfo {
    if (typeof value !== "object" || value == null) {
        return false;
    }
    const record: Record<string, unknown> = { ...value };
    return (
        record.fernDocsDev === true &&
        typeof record.pid === "number" &&
        typeof record.port === "number" &&
        typeof record.backendPort === "number" &&
        typeof record.url === "string" &&
        typeof record.fernDirectory === "string"
    );
}

/** Returns why a control request must be refused, or `undefined` if it may proceed. */
export function getControlRequestRejection({
    remoteAddress,
    host,
    origin,
    controlHeader,
    serverPort
}: {
    remoteAddress: string | undefined;
    host: string | undefined;
    origin: string | undefined;
    controlHeader: string | string[] | undefined;
    serverPort: number;
}): string | undefined {
    if (!isLoopbackAddress(remoteAddress)) {
        return "only requests from this machine are accepted";
    }
    if (controlHeader !== DOCS_DEV_CONTROL_HEADER_VALUE) {
        return `missing ${DOCS_DEV_CONTROL_HEADER}: ${DOCS_DEV_CONTROL_HEADER_VALUE} header`;
    }
    if (host == null || !LOOPBACK_HOSTNAMES.has(stripPort(host).toLowerCase())) {
        return "Host must be localhost, 127.0.0.1 or [::1]";
    }
    if (origin != null && !isSameServerOrigin(origin, serverPort)) {
        return "cross-origin requests are not accepted";
    }
    return undefined;
}

function isLoopbackAddress(address: string | undefined): boolean {
    if (address == null) {
        return false;
    }
    return address === "::1" || address.startsWith("127.") || address.startsWith("::ffff:127.");
}

function stripPort(host: string): string {
    if (host.startsWith("[")) {
        const end = host.indexOf("]");
        return end >= 0 ? host.slice(0, end + 1) : host;
    }
    const colon = host.indexOf(":");
    return colon >= 0 ? host.slice(0, colon) : host;
}

function isSameServerOrigin(origin: string, serverPort: number): boolean {
    let parsed: URL;
    try {
        parsed = new URL(origin);
    } catch {
        return false;
    }
    return (
        parsed.protocol === "http:" && LOOPBACK_HOSTNAMES.has(parsed.hostname) && parsed.port === serverPort.toString()
    );
}
