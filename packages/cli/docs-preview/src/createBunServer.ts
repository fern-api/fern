import { DocsV2Read } from "@fern-api/fdr-sdk";

import { DebugLogger } from "./DebugLogger.js";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
} as const;

// Minimal Bun runtime type definitions for native WebSocket support.
// These are used only when the CLI is run under Bun (re: oven-sh/bun#5951).
interface BunServerWebSocket<T> {
    send(data: string | Buffer): number;
    close(code?: number, reason?: string): void;
    readonly data: T;
}
interface BunNamespace {
    serve<T>(options: {
        port: number;
        fetch(
            req: Request,
            server: { upgrade(req: Request, options?: { data?: T }): boolean }
        ): Response | undefined | Promise<Response | undefined>;
        websocket: {
            open(ws: BunServerWebSocket<T>): void;
            message(ws: BunServerWebSocket<T>, data: string | Buffer): void;
            close(ws: BunServerWebSocket<T>, code: number, reason: string): void;
        };
    }): { stop(closeActiveConnections?: boolean): void };
    file(filePath: string): Blob;
}

export interface BunServerOptions {
    port: number;
    debugLogger: DebugLogger;
    getDocsLoadResponse(): DocsV2Read.LoadDocsForUrlResponse;
}

export interface BunServer {
    sendData(data: unknown): void;
    stop(closeActiveConnections?: boolean): void;
}

/**
 * Creates a Bun-native HTTP + WebSocket server. Returns `undefined` when not
 * running under Bun so callers can fall back to a standard http.Server.
 */
export function createBunServer(options: BunServerOptions): BunServer | undefined {
    const bun = getBun();
    if (bun == null) {
        return undefined;
    }

    const { port, debugLogger, getDocsLoadResponse } = options;

    type WsData = { connectionId: string };
    const connections = new Map<BunServerWebSocket<WsData>, { pingInterval: NodeJS.Timeout; lastPong: number }>();

    function sendData(data: unknown): void {
        const message = JSON.stringify(data);
        const dead: BunServerWebSocket<WsData>[] = [];
        for (const [ws] of connections) {
            try {
                ws.send(message);
            } catch {
                dead.push(ws);
            }
        }
        for (const ws of dead) {
            const metadata = connections.get(ws);
            if (metadata) {
                clearInterval(metadata.pingInterval);
                connections.delete(ws);
            }
        }
    }

    const server = bun.serve<WsData>({
        port,
        fetch(req, bunHttpServer) {
            if (req.method === "OPTIONS") {
                return new Response(null, { status: 204, headers: CORS_HEADERS });
            }

            const url = new URL(req.url);

            // WebSocket upgrade handling (re: oven-sh/bun#5951).
            if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
                bunHttpServer.upgrade(req, { data: { connectionId: `${Date.now()}` } });
                return undefined;
            }

            // POST /v2/registry/docs/load-with-url
            if (req.method === "POST" && url.pathname === "/v2/registry/docs/load-with-url") {
                return new Response(JSON.stringify(getDocsLoadResponse()), {
                    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
                });
            }

            // GET /_local/...
            const localMatch = /^\/_local\/(.*)/.exec(url.pathname);
            if (req.method === "GET" && localMatch != null) {
                return new Response(bun.file(`/${localMatch[1]}`), { headers: CORS_HEADERS });
            }

            return new Response("Not Found", { status: 404 });
        },
        websocket: {
            open(ws) {
                const { connectionId } = ws.data;
                const pingInterval = setInterval(() => {
                    const metadata = connections.get(ws);
                    if (!metadata) {
                        return;
                    }
                    const now = Date.now();
                    if (now - metadata.lastPong > 90000) {
                        ws.close();
                        return;
                    }
                    try {
                        ws.send(JSON.stringify({ type: "ping", timestamp: now }));
                    } catch {
                        ws.close();
                    }
                }, 30000);
                connections.set(ws, { pingInterval, lastPong: Date.now() });
                try {
                    ws.send(JSON.stringify({ type: "connected", connectionId }));
                } catch {
                    // no-op; the client may have disconnected immediately.
                }
            },
            message(ws, data) {
                try {
                    const parsed = JSON.parse(data.toString());
                    if (parsed.type === "pong") {
                        const metadata = connections.get(ws);
                        if (metadata) {
                            metadata.lastPong = Date.now();
                        }
                    } else if (DebugLogger.isMetricsMessage(parsed)) {
                        void debugLogger.logFrontendMetrics(parsed);
                    }
                } catch {
                    // no-op; ignore malformed messages
                }
            },
            close(ws) {
                const metadata = connections.get(ws);
                if (metadata) {
                    clearInterval(metadata.pingInterval);
                    connections.delete(ws);
                }
            }
        }
    });

    return {
        sendData,
        stop: (closeActiveConnections) => server.stop(closeActiveConnections)
    };
}

function getBun(): BunNamespace | undefined {
    return (globalThis as { Bun?: BunNamespace }).Bun;
}
