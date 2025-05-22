import { RequestHandlerOptions } from "msw";
import type { SetupServer } from "msw/node";

import { mockEndpointBuilder } from "./mockEndpointBuilder";

export interface MockServerOptions {
    baseUrl: string;
    server: SetupServer;
}

/**
 * MockServer wraps MSW functionality for easier API mocking in tests
 */
export class MockServer {
    private readonly server: SetupServer;
    public readonly baseUrl: string;

    /**
     * Create a new MockServer instance
     * @param baseUrl - The base URL for all request handlers
     */
    constructor({ baseUrl, server }: MockServerOptions) {
        this.baseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        this.server = server;
    }

    public mockEndpoint(options?: RequestHandlerOptions): ReturnType<typeof mockEndpointBuilder> {
        const builder = mockEndpointBuilder({
            once: options?.once,
            onBuild: (handler) => {
                this.server.use(handler);
            },
        }).baseUrl(this.baseUrl);
        return builder;
    }
}
