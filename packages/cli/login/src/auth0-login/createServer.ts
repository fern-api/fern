import http from "http";

// this must align with the allowed ports in Auth0
const PORTS = [3129];

export interface ServerAndPort {
    server: http.Server;
    origin: string;
}

export async function createServer(): Promise<ServerAndPort> {
    const server = http.createServer();
    const port = await Promise.any(
        PORTS.map(async (port) => {
            await listenOnPort(server, port);
            return port;
        })
    );
    return { server, origin: `http://localhost:${port}` };
}

function listenOnPort(server: http.Server, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
        server.on("error", reject);
        server.listen(port, undefined, undefined, resolve);
    });
}
