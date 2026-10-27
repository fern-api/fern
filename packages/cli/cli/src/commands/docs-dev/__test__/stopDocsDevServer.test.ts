import http from "http";
import net from "net";
import { afterEach, describe, expect, it } from "vitest";

import { stopDocsDevServer } from "../stopDocsDevServer.js";

const servers: http.Server[] = [];

afterEach(async () => {
    await Promise.all(servers.splice(0).map((server) => new Promise((resolve) => server.close(resolve))));
});

function listen(handler: http.RequestListener): Promise<{ server: http.Server; port: number }> {
    const server = http.createServer(handler);
    servers.push(server);
    return new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            resolve({ server, port: typeof address === "object" && address != null ? address.port : 0 });
        });
    });
}

function getUnusedPort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.once("error", reject);
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();
            const port = typeof address === "object" && address != null ? address.port : 0;
            server.close(() => resolve(port));
        });
    });
}

/** A stand-in for the `fern docs dev` proxy's control routes. */
function fakeDocsDev({
    shutdownStatus = 202,
    closeOnShutdown = true
}: {
    shutdownStatus?: number;
    closeOnShutdown?: boolean;
} = {}): Promise<{ server: http.Server; port: number; requests: string[] }> {
    const requests: string[] = [];
    let server: http.Server | undefined;
    let port = 0;
    return listen((req, res) => {
        requests.push(`${req.method} ${req.url} ${req.headers["x-fern-docs-dev"] ?? ""}`);
        if (req.url === "/__fern/dev-server") {
            res.writeHead(200, { "content-type": "application/json" });
            res.end(
                JSON.stringify({
                    fernDocsDev: true,
                    pid: 4242,
                    port,
                    backendPort: port + 1,
                    url: `http://localhost:${port}`,
                    fernDirectory: "/repo/fern"
                })
            );
            return;
        }
        if (req.url === "/__fern/shutdown") {
            res.writeHead(shutdownStatus, { connection: "close" });
            res.end();
            if (closeOnShutdown && shutdownStatus === 202) {
                server?.close();
            }
            return;
        }
        res.writeHead(404);
        res.end();
    }).then((listening) => {
        server = listening.server;
        port = listening.port;
        return { ...listening, requests };
    });
}

describe("stopDocsDevServer", () => {
    it("reports no-server when nothing is listening", async () => {
        const port = await getUnusedPort();
        await expect(stopDocsDevServer({ port })).resolves.toEqual({ stopped: false, port, reason: "no-server" });
    });

    it("leaves a server that isn't fern docs dev alone", async () => {
        const requests: string[] = [];
        const { port } = await listen((req, res) => {
            requests.push(`${req.method} ${req.url}`);
            res.writeHead(404);
            res.end("not found");
        });
        await expect(stopDocsDevServer({ port })).resolves.toEqual({
            stopped: false,
            port,
            reason: "not-fern-docs-dev"
        });
        expect(requests).toEqual(["GET /__fern/dev-server"]);
    });

    it("treats a non-HTTP listener as not fern docs dev", async () => {
        const sockets = new Set<net.Socket>();
        const server = net.createServer((socket) => {
            sockets.add(socket);
            socket.on("error", () => undefined);
            socket.end("hello\n");
        });
        await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
        const address = server.address();
        const port = typeof address === "object" && address != null ? address.port : 0;
        try {
            await expect(stopDocsDevServer({ port })).resolves.toEqual({
                stopped: false,
                port,
                reason: "not-fern-docs-dev"
            });
        } finally {
            for (const socket of sockets) {
                socket.destroy();
            }
            await new Promise((resolve) => server.close(resolve));
        }
    });

    it("stops a fern docs dev server and waits for its port to close", async () => {
        const { port, requests } = await fakeDocsDev();
        await expect(stopDocsDevServer({ port })).resolves.toEqual({
            stopped: true,
            port,
            url: `http://localhost:${port}`,
            pid: 4242,
            fernDirectory: "/repo/fern"
        });
        expect(requests).toEqual(["GET /__fern/dev-server 1", "POST /__fern/shutdown 1"]);
        await expect(stopDocsDevServer({ port })).resolves.toMatchObject({ stopped: false, reason: "no-server" });
    });

    it("fails when the server refuses the shutdown request", async () => {
        const { port } = await fakeDocsDev({ shutdownStatus: 403 });
        await expect(stopDocsDevServer({ port })).rejects.toThrow(/refused the shutdown request \(HTTP 403\)/);
    });

    it("fails when the port stays open after the shutdown request", async () => {
        const { port } = await fakeDocsDev({ closeOnShutdown: false });
        await expect(stopDocsDevServer({ port, portCloseTimeoutMs: 300 })).rejects.toThrow(/still running/);
    });
});
