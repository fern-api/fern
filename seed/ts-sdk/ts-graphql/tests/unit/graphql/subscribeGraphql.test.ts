import type { AddressInfo } from "node:net";

import { WebSocket, WebSocketServer } from "ws";

import { GraphqlError } from "../../../src/core/graphql/GraphqlError";
import { subscribeGraphql } from "../../../src/core/graphql/subscribeGraphql";

interface Message {
    id: string;
    text: string;
}

/**
 * Stands up an in-process `graphql-transport-ws` server that performs the handshake
 * (`connection_init` -> `connection_ack`), then on `subscribe` emits the provided sequence of
 * server messages in order. Returns the `ws://` url and a teardown function.
 */
function startServer(messages: object[]): Promise<{ url: string; close: () => Promise<void> }> {
    return new Promise((resolve) => {
        const wss = new WebSocketServer({ port: 0 });
        wss.on("connection", (socket) => {
            socket.on("message", (raw) => {
                const message = JSON.parse(raw.toString()) as { type: string };
                if (message.type === "connection_init") {
                    socket.send(JSON.stringify({ type: "connection_ack" }));
                    return;
                }
                if (message.type === "subscribe") {
                    for (const outbound of messages) {
                        socket.send(JSON.stringify(outbound));
                    }
                }
            });
        });
        wss.on("listening", () => {
            const { port } = wss.address() as AddressInfo;
            resolve({
                url: `ws://localhost:${port}`,
                close: () =>
                    new Promise<void>((res) => {
                        wss.close(() => res());
                    }),
            });
        });
    });
}

describe("subscribeGraphql", () => {
    it("yields unwrapped, typed events then completes", async () => {
        const server = await startServer([
            { type: "next", id: "1", payload: { data: { messageAdded: { id: "1", text: "hello" } } } },
            { type: "next", id: "1", payload: { data: { messageAdded: { id: "2", text: "world" } } } },
            { type: "complete", id: "1" },
        ]);

        try {
            const events: Message[] = [];
            for await (const event of subscribeGraphql<Message>({
                url: server.url,
                query: "subscription messageAdded { messageAdded { id text } }",
                operationName: "messageAdded",
                WebSocket,
            })) {
                events.push(event);
            }

            expect(events).toEqual([
                { id: "1", text: "hello" },
                { id: "2", text: "world" },
            ]);
        } finally {
            await server.close();
        }
    });

    it("throws a GraphqlError when a next message carries errors", async () => {
        const server = await startServer([{ type: "next", id: "1", payload: { errors: [{ message: "boom" }] } }]);

        try {
            const iterate = async (): Promise<void> => {
                for await (const _event of subscribeGraphql<Message>({
                    url: server.url,
                    query: "subscription messageAdded { messageAdded { id text } }",
                    operationName: "messageAdded",
                    WebSocket,
                })) {
                    // no-op
                }
            };
            await expect(iterate()).rejects.toBeInstanceOf(GraphqlError);
        } finally {
            await server.close();
        }
    });

    it("resolves an async connectionParams supplier and sends it in connection_init", async () => {
        let initPayload: Record<string, unknown> | undefined;
        const wss = new WebSocketServer({ port: 0 });
        wss.on("connection", (socket) => {
            socket.on("message", (raw) => {
                const message = JSON.parse(raw.toString()) as { type: string; payload?: Record<string, unknown> };
                if (message.type === "connection_init") {
                    initPayload = message.payload;
                    socket.send(JSON.stringify({ type: "connection_ack" }));
                    return;
                }
                if (message.type === "subscribe") {
                    socket.send(
                        JSON.stringify({
                            type: "next",
                            id: "1",
                            payload: { data: { messageAdded: { id: "1", text: "hi" } } },
                        }),
                    );
                    socket.send(JSON.stringify({ type: "complete", id: "1" }));
                }
            });
        });
        await new Promise<void>((res) => wss.on("listening", () => res()));
        const { port } = wss.address() as AddressInfo;

        let supplierCalls = 0;
        // The generator passes the SAME supplier to both connectionParams and headers, so it must be
        // resolved exactly once (one auth-provider lookup).
        const connectionParams = async (): Promise<Record<string, unknown>> => {
            supplierCalls += 1;
            return { Authorization: "Bearer resolved-token" };
        };

        try {
            const events: Message[] = [];
            for await (const event of subscribeGraphql<Message>({
                url: `ws://localhost:${port}`,
                query: "subscription messageAdded { messageAdded { id text } }",
                operationName: "messageAdded",
                connectionParams,
                headers: connectionParams,
                WebSocket,
            })) {
                events.push(event);
            }
            expect(events).toEqual([{ id: "1", text: "hi" }]);
            expect(initPayload).toEqual({ Authorization: "Bearer resolved-token" });
            expect(supplierCalls).toBe(1);
        } finally {
            await new Promise<void>((res) => wss.close(() => res()));
        }
    });

    it("tears down the socket when the consumer breaks out early", async () => {
        const server = await startServer([
            { type: "next", id: "1", payload: { data: { messageAdded: { id: "1", text: "hello" } } } },
            { type: "next", id: "1", payload: { data: { messageAdded: { id: "2", text: "world" } } } },
        ]);

        try {
            const events: Message[] = [];
            for await (const event of subscribeGraphql<Message>({
                url: server.url,
                query: "subscription messageAdded { messageAdded { id text } }",
                operationName: "messageAdded",
                WebSocket,
            })) {
                events.push(event);
                break;
            }
            expect(events).toHaveLength(1);
        } finally {
            await server.close();
        }
    });
});
