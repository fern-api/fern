import { setupServer } from "msw/node";
import { MockServer } from "./MockServer";
import { randomBaseUrl } from "./randomBaseUrl";

const mswServer = setupServer();
interface MockServerOptions {
    baseUrl?: string;
}

class MockServerPool {
    private servers: MockServer[] = [];

    /**
     * Creates a new MockServer instance with a UUID-based hostname and adds it to the pool
     */
    public createServer(options?: Partial<MockServerOptions>): MockServer {
        const baseUrl = options?.baseUrl || randomBaseUrl();
        const server = new MockServer({ baseUrl, server: mswServer });
        this.servers.push(server);
        return server;
    }

    /**
     * Gets all MockServer instances in the pool
     */
    public getServers(): MockServer[] {
        return [...this.servers];
    }

    public listen(): void {
        mswServer.listen({
            onUnhandledRequest: "error",
        });
    }

    public close(): void {
        this.servers = [];
        mswServer.close();
    }
}

export const mockServerPool = new MockServerPool();
