/**
 * End-to-end test for SSE stream auto-reconnection.
 *
 * This test spins up a real HTTP server that serves SSE events and simulates
 * connection drops. It verifies that the Stream class transparently reconnects
 * using the Last-Event-ID header, just as a generated SDK would in production.
 *
 * Run with: npx tsx --test tests/e2e/sse-reconnection.test.ts
 */
import http from "node:http";
import { test, describe } from "node:test";
import assert from "node:assert";

// ---------------------------------------------------------------------------
// Inline Stream class (compiled from Stream.template.ts, "standard" web variant)
// This avoids import issues with the template EJS syntax.
// ---------------------------------------------------------------------------

declare namespace Stream {
    interface Args {
        stream: ReadableStream;
        eventShape: JsonEvent | SseEvent;
        signal?: AbortSignal;
        reconnectionEnabled?: boolean;
        maxReconnectionAttempts?: number;
        reconnect?: (lastEventId: string) => Promise<ReadableStream>;
    }

    interface JsonEvent {
        type: "json";
        messageTerminator: string;
    }

    interface SseEvent {
        type: "sse";
        streamTerminator?: string;
        eventDiscriminator?: string;
        resumable?: boolean;
    }
}

interface ServerSentEvent<T> {
    data: T;
    id?: string;
    retry?: number;
    event?: string;
}

const DATA_PREFIX = "data:";
const EVENT_PREFIX = "event:";
const ID_PREFIX = "id:";
const RETRY_PREFIX = "retry:";

const DEFAULT_MAX_RECONNECTION_ATTEMPTS = 5;
const DEFAULT_RECONNECT_DELAY_MS = 1_000;
const MAX_RECONNECT_DELAY_MS = 30_000;

function fromJson(json: string): unknown {
    return JSON.parse(json);
}

class Stream<T> implements AsyncIterable<T> {
    private stream: ReadableStream;
    private parse: (val: unknown) => Promise<T>;
    private prefix: string | undefined;
    private messageTerminator: string;
    private streamTerminator: string | undefined;
    private eventDiscriminator: string | undefined;
    private resumable: boolean;
    private reconnectionEnabled: boolean;
    private maxReconnectionAttempts: number;
    private reconnect: ((lastEventId: string) => Promise<ReadableStream>) | undefined;
    private controller: AbortController = new AbortController();
    private decoder: TextDecoder | undefined;
    private externalSignal: AbortSignal | undefined;
    private onExternalAbort: (() => void) | undefined;

    constructor({
        stream,
        parse,
        eventShape,
        signal,
        reconnectionEnabled,
        maxReconnectionAttempts,
        reconnect,
    }: Stream.Args & { parse: (val: unknown) => Promise<T> }) {
        this.stream = stream;
        this.parse = parse;
        if (eventShape.type === "sse") {
            this.prefix = DATA_PREFIX;
            this.messageTerminator = "\n";
            this.streamTerminator = eventShape.streamTerminator;
            this.eventDiscriminator = eventShape.eventDiscriminator;
            this.resumable = eventShape.resumable ?? false;
        } else {
            this.messageTerminator = eventShape.messageTerminator;
            this.resumable = false;
        }
        this.reconnectionEnabled = reconnectionEnabled ?? true;
        this.maxReconnectionAttempts = maxReconnectionAttempts ?? DEFAULT_MAX_RECONNECTION_ATTEMPTS;
        this.reconnect = reconnect;
        if (signal != null) {
            this.externalSignal = signal;
            this.onExternalAbort = () => this.controller.abort();
            signal.addEventListener("abort", this.onExternalAbort, { once: true });
        }

        if (typeof TextDecoder !== "undefined") {
            this.decoder = new TextDecoder("utf-8");
        }
    }

    private async *iterMessages(): AsyncGenerator<ServerSentEvent<T>, void> {
        if (this.eventDiscriminator != null) {
            yield* this.iterSseEvents();
        } else {
            yield* this.iterDataMessages();
        }
    }

    private async *iterDataMessages(): AsyncGenerator<ServerSentEvent<T>, void> {
        let reconnectAttempts = 0;
        let currentStream: ReadableStream = this.stream;
        let lastId: string | undefined;
        let lastRetry: number | undefined;

        while (true) {
            const stream = readableStreamAsyncIterable<Uint8Array>(currentStream);
            let buf = "";
            let dataValue: string | undefined;

            for await (const chunk of stream) {
                buf += this.decodeChunk(chunk);

                let terminatorIndex: number;
                while ((terminatorIndex = buf.indexOf(this.messageTerminator)) >= 0) {
                    const line = buf.slice(0, terminatorIndex);
                    buf = buf.slice(terminatorIndex + this.messageTerminator.length);

                    if (!line.trim()) {
                        if (this.prefix != null && dataValue != null) {
                            if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
                                return;
                            }
                            const data = await this.parse(fromJson(dataValue));
                            yield { data, id: lastId, retry: lastRetry, event: undefined };
                            reconnectAttempts = 0;
                            dataValue = undefined;
                        }
                        continue;
                    }

                    if (line.startsWith(ID_PREFIX)) {
                        const idValue = line.slice(ID_PREFIX.length).trim();
                        if (!idValue.includes("\0")) {
                            lastId = idValue;
                        }
                        continue;
                    }
                    if (line.startsWith(RETRY_PREFIX)) {
                        const retryValue = line.slice(RETRY_PREFIX.length).trim();
                        const parsed = parseInt(retryValue, 10);
                        if (!Number.isNaN(parsed) && String(parsed) === retryValue) {
                            lastRetry = parsed;
                        }
                        continue;
                    }

                    if (this.prefix != null) {
                        const prefixIndex = line.indexOf(this.prefix);
                        if (prefixIndex === -1) {
                            continue;
                        }
                        const val = line.slice(prefixIndex + this.prefix.length).trim();
                        dataValue = dataValue != null ? `${dataValue}\n${val}` : val;
                    } else {
                        if (this.streamTerminator != null && line.includes(this.streamTerminator)) {
                            return;
                        }
                        const data = await this.parse(fromJson(line));
                        yield { data, id: lastId, retry: lastRetry, event: undefined };
                        reconnectAttempts = 0;
                    }
                }
            }

            if (this.prefix != null && dataValue != null) {
                if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
                    return;
                }
                const data = await this.parse(fromJson(dataValue));
                yield { data, id: lastId, retry: lastRetry, event: undefined };
                reconnectAttempts = 0;
            }

            if (!this.shouldReconnect(lastId, reconnectAttempts)) {
                return;
            }

            reconnectAttempts++;
            await this.delayReconnect(lastRetry);
            if (this.controller.signal.aborted) {
                return;
            }
            // Re-check after async delay; needed for TypeScript narrowing.
            const reconnectFn = this.reconnect;
            if (reconnectFn == null || lastId == null) {
                return;
            }
            try {
                const reconnected = await reconnectFn(lastId);
                if (reconnected == null) {
                    currentStream = this.createEmptyStream();
                    continue;
                }
                currentStream = reconnected;
            } catch {
                // Failed reconnect (e.g. HTTP error); assign an empty stream
                // so the next iteration is a safe no-op before shouldReconnect.
                currentStream = this.createEmptyStream();
                continue;
            }
        }
    }

    private async *iterSseEvents(): AsyncGenerator<ServerSentEvent<T>, void> {
        let reconnectAttempts = 0;
        let currentStream: ReadableStream = this.stream;
        let lastId: string | undefined;
        let lastRetry: number | undefined;

        while (true) {
            const stream = readableStreamAsyncIterable<Uint8Array>(currentStream);
            let buf = "";
            let eventType: string | undefined;
            let dataValue: string | undefined;

            for await (const chunk of stream) {
                buf += this.decodeChunk(chunk);

                let terminatorIndex: number;
                while ((terminatorIndex = buf.indexOf("\n")) >= 0) {
                    const line = buf.slice(0, terminatorIndex).replace(/\r$/, "");
                    buf = buf.slice(terminatorIndex + 1);

                    if (!line.trim()) {
                        if (dataValue != null) {
                            const data = await this.dispatchSseEvent(dataValue, eventType);
                            if (data == null) {
                                return;
                            }
                            yield { data, id: lastId, retry: lastRetry, event: eventType };
                            reconnectAttempts = 0;
                        }
                        eventType = undefined;
                        dataValue = undefined;
                        continue;
                    }

                    if (line.startsWith(EVENT_PREFIX)) {
                        eventType = line.slice(EVENT_PREFIX.length).trim();
                    } else if (line.startsWith(DATA_PREFIX)) {
                        const val = line.slice(DATA_PREFIX.length).trim();
                        dataValue = dataValue != null ? `${dataValue}\n${val}` : val;
                    } else if (line.startsWith(ID_PREFIX)) {
                        const idValue = line.slice(ID_PREFIX.length).trim();
                        if (!idValue.includes("\0")) {
                            lastId = idValue;
                        }
                    } else if (line.startsWith(RETRY_PREFIX)) {
                        const retryValue = line.slice(RETRY_PREFIX.length).trim();
                        const parsed = parseInt(retryValue, 10);
                        if (!Number.isNaN(parsed) && String(parsed) === retryValue) {
                            lastRetry = parsed;
                        }
                    }
                }
            }

            if (dataValue != null) {
                const data = await this.dispatchSseEvent(dataValue, eventType);
                if (data != null) {
                    yield { data, id: lastId, retry: lastRetry, event: eventType };
                    reconnectAttempts = 0;
                }
            }

            if (!this.shouldReconnect(lastId, reconnectAttempts)) {
                return;
            }

            reconnectAttempts++;
            await this.delayReconnect(lastRetry);
            if (this.controller.signal.aborted) {
                return;
            }
            // Re-check after async delay; needed for TypeScript narrowing.
            const reconnectFn = this.reconnect;
            if (reconnectFn == null || lastId == null) {
                return;
            }
            try {
                const reconnected = await reconnectFn(lastId);
                if (reconnected == null) {
                    currentStream = this.createEmptyStream();
                    continue;
                }
                currentStream = reconnected;
            } catch {
                // Failed reconnect (e.g. HTTP error); assign an empty stream
                // so the next iteration is a safe no-op before shouldReconnect.
                currentStream = this.createEmptyStream();
                continue;
            }
        }
    }

    private async dispatchSseEvent(dataValue: string, eventType: string | undefined): Promise<T | null> {
        if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
            return null;
        }
        return this.parse(this.injectDiscriminator(fromJson(dataValue), eventType));
    }

    private shouldReconnect(lastId: string | undefined, reconnectAttempts: number): boolean {
        if (!this.resumable) {
            return false;
        }
        if (this.streamTerminator == null) {
            return false;
        }
        if (!this.reconnectionEnabled) {
            return false;
        }
        if (this.reconnect == null) {
            return false;
        }
        if (lastId == null || lastId === "") {
            return false;
        }
        if (reconnectAttempts >= this.maxReconnectionAttempts) {
            return false;
        }
        if (this.controller.signal.aborted) {
            return false;
        }
        return true;
    }

    private async delayReconnect(lastRetry: number | undefined): Promise<void> {
        const base = lastRetry != null && lastRetry > 0 ? lastRetry : DEFAULT_RECONNECT_DELAY_MS;
        const delay = Math.min(base, MAX_RECONNECT_DELAY_MS);
        const signal = this.controller.signal;
        if (signal.aborted) {
            return;
        }
        await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
                signal.removeEventListener("abort", onAbort);
                resolve();
            }, delay);
            const onAbort = (): void => {
                clearTimeout(timer);
                resolve();
            };
            signal.addEventListener("abort", onAbort, { once: true });
        });
    }

    private injectDiscriminator(parsed: unknown, eventType: string | undefined): unknown {
        if (this.eventDiscriminator == null || eventType == null) {
            return parsed;
        }
        if (parsed == null || typeof parsed !== "object" || Array.isArray(parsed)) {
            return parsed;
        }
        const obj = parsed as Record<string, unknown>;
        if (this.eventDiscriminator in obj) {
            return parsed;
        }
        return { [this.eventDiscriminator]: eventType, ...obj };
    }

    private createEmptyStream(): ReadableStream {
        return new ReadableStream({ start(controller) { controller.close(); } });
    }

    private removeAbortListener(): void {
        if (this.externalSignal != null && this.onExternalAbort != null) {
            this.externalSignal.removeEventListener("abort", this.onExternalAbort);
            this.onExternalAbort = undefined;
        }
    }

    public withMetadata(): AsyncIterable<ServerSentEvent<T>> {
        const self = this;
        return {
            async *[Symbol.asyncIterator]() {
                try {
                    yield* self.iterMessages();
                } finally {
                    self.removeAbortListener();
                }
            },
        };
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T, void, unknown> {
        try {
            for await (const event of this.iterMessages()) {
                yield event.data;
            }
        } finally {
            this.removeAbortListener();
        }
    }

    private decodeChunk(chunk: unknown): string {
        if (this.decoder != null && (chunk instanceof Uint8Array || chunk instanceof ArrayBuffer)) {
            return this.decoder.decode(chunk, { stream: true });
        }
        if (Buffer.isBuffer(chunk)) {
            return chunk.toString("utf-8");
        }
        if (chunk instanceof ArrayBuffer) {
            return Buffer.from(chunk).toString("utf-8");
        }
        return String(chunk);
    }
}

function hasAsyncIterator<T>(obj: object): obj is AsyncIterable<T> {
    return Symbol.asyncIterator in obj;
}

function readableStreamAsyncIterable<T>(stream: ReadableStream): AsyncIterableIterator<T> {
    if (hasAsyncIterator<T>(stream)) {
        return stream[Symbol.asyncIterator]();
    }

    const reader = stream.getReader();
    return {
        async next() {
            try {
                const result = await reader.read();
                if (result?.done) {
                    reader.releaseLock();
                }
                return result;
            } catch (e) {
                reader.releaseLock();
                throw e;
            }
        },
        async return() {
            const cancelPromise = reader.cancel();
            reader.releaseLock();
            await cancelPromise;
            return { done: true, value: undefined };
        },
        [Symbol.asyncIterator]() {
            return this;
        },
    };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertBody(response: Response): ReadableStream {
    const body = response.body;
    if (body == null) {
        throw new Error("response body is null");
    }
    return body;
}

function at<T>(arr: T[], index: number): T {
    const val = arr[index];
    if (val === undefined) {
        throw new Error(`expected element at index ${index}`);
    }
    return val;
}

// ---------------------------------------------------------------------------
// E2E Tests
// ---------------------------------------------------------------------------

function createSseServer(handler: (req: http.IncomingMessage, res: http.ServerResponse) => void): Promise<{ server: http.Server; port: number }> {
    return new Promise((resolve) => {
        const server = http.createServer(handler);
        server.listen(0, "127.0.0.1", () => {
            const addr = server.address() as { port: number };
            resolve({ server, port: addr.port });
        });
    });
}

function closeServer(server: http.Server): Promise<void> {
    return new Promise((resolve) => server.close(() => resolve()));
}

describe("SSE Stream Reconnection E2E", () => {
    test("reconnects on connection drop and resumes with Last-Event-ID", async () => {
        const connectionAttempts: { lastEventId: string | undefined }[] = [];
        let connectionCount = 0;

        const { server, port } = await createSseServer((req, res) => {
            const lastEventId = req.headers["last-event-id"] as string | undefined;
            connectionAttempts.push({ lastEventId });
            connectionCount++;

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });

            if (connectionCount === 1) {
                // First connection: send 3 events, then drop (no terminator)
                res.write("id: evt-1\ndata: {\"value\": 1}\n\n");
                res.write("id: evt-2\ndata: {\"value\": 2}\n\n");
                res.write("id: evt-3\ndata: {\"value\": 3}\n\n");
                res.end(); // simulate connection drop
            } else if (connectionCount === 2) {
                // Second connection (reconnect): send remaining events with terminator
                res.write("id: evt-4\ndata: {\"value\": 4}\n\n");
                res.write("id: evt-5\ndata: {\"value\": 5}\n\n");
                res.write("data: [DONE]\n\n");
                res.end();
            } else {
                res.write("data: [DONE]\n\n");
                res.end();
            }
        });

        try {
            const url = `http://127.0.0.1:${port}/sse`;

            // Initial fetch (like SDK fetcher would do)
            const initialResponse = await fetch(url);

            // Reconnect function (like the generated SDK creates)
            const reconnect = async (lastEventId: string): Promise<ReadableStream> => {
                const response = await fetch(url, {
                    headers: { "Last-Event-ID": lastEventId },
                });
                return assertBody(response);
            };

            const stream = new Stream<{ value: number }>({
                stream: assertBody(initialResponse),
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "sse", streamTerminator: "[DONE]", resumable: true },
                reconnectionEnabled: true,
                maxReconnectionAttempts: 3,
                reconnect,
            });

            const messages: { value: number }[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            // All 5 events received seamlessly
            assert.deepStrictEqual(messages, [
                { value: 1 },
                { value: 2 },
                { value: 3 },
                { value: 4 },
                { value: 5 },
            ]);

            // Exactly 2 connections made
            assert.strictEqual(connectionAttempts.length, 2);
            // First connection had no Last-Event-ID
            assert.strictEqual(at(connectionAttempts, 0).lastEventId, undefined);
            // Second connection sent Last-Event-ID = "evt-3"
            assert.strictEqual(at(connectionAttempts, 1).lastEventId, "evt-3");

            console.log("✓ Reconnection works: got all 5 events across 2 connections");
            console.log(`  Connection 1: no Last-Event-ID → events evt-1..evt-3`);
            console.log(`  Connection 2: Last-Event-ID=evt-3 → events evt-4..evt-5 + [DONE]`);
        } finally {
            await closeServer(server);
        }
    });

    test("handles multiple sequential reconnections", async () => {
        const connectionAttempts: { lastEventId: string | undefined }[] = [];
        let connectionCount = 0;

        const { server, port } = await createSseServer((req, res) => {
            const lastEventId = req.headers["last-event-id"] as string | undefined;
            connectionAttempts.push({ lastEventId });
            connectionCount++;

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });

            if (connectionCount === 1) {
                res.write("id: 1\ndata: {\"seq\": 1}\n\n");
                res.end(); // drop
            } else if (connectionCount === 2) {
                res.write("id: 2\ndata: {\"seq\": 2}\n\n");
                res.end(); // drop again
            } else if (connectionCount === 3) {
                res.write("id: 3\ndata: {\"seq\": 3}\n\n");
                res.write("data: [DONE]\n\n");
                res.end();
            }
        });

        try {
            const url = `http://127.0.0.1:${port}/sse`;
            const initialResponse = await fetch(url);

            const reconnect = async (lastEventId: string): Promise<ReadableStream> => {
                const response = await fetch(url, {
                    headers: { "Last-Event-ID": lastEventId },
                });
                return assertBody(response);
            };

            const stream = new Stream<{ seq: number }>({
                stream: assertBody(initialResponse),
                parse: async (val: unknown) => val as { seq: number },
                eventShape: { type: "sse", streamTerminator: "[DONE]", resumable: true },
                reconnectionEnabled: true,
                maxReconnectionAttempts: 5,
                reconnect,
            });

            const messages: { seq: number }[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            assert.deepStrictEqual(messages, [{ seq: 1 }, { seq: 2 }, { seq: 3 }]);
            assert.strictEqual(connectionAttempts.length, 3);
            assert.strictEqual(at(connectionAttempts, 0).lastEventId, undefined);
            assert.strictEqual(at(connectionAttempts, 1).lastEventId, "1");
            assert.strictEqual(at(connectionAttempts, 2).lastEventId, "2");

            console.log("✓ Multiple reconnections work: 3 connections, all events received");
        } finally {
            await closeServer(server);
        }
    });

    test("respects server retry directive (delays reconnection)", async () => {
        let connectionCount = 0;
        const connectionTimestamps: number[] = [];

        const { server, port } = await createSseServer((req, res) => {
            connectionTimestamps.push(Date.now());
            connectionCount++;

            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });

            if (connectionCount === 1) {
                // Tell client to wait 150ms before reconnecting
                res.write("retry: 150\nid: 1\ndata: {\"msg\": \"first\"}\n\n");
                res.end();
            } else {
                res.write("id: 2\ndata: {\"msg\": \"second\"}\n\n");
                res.write("data: [DONE]\n\n");
                res.end();
            }
        });

        try {
            const url = `http://127.0.0.1:${port}/sse`;
            const initialResponse = await fetch(url);

            const reconnect = async (lastEventId: string): Promise<ReadableStream> => {
                const response = await fetch(url, {
                    headers: { "Last-Event-ID": lastEventId },
                });
                return assertBody(response);
            };

            const stream = new Stream<{ msg: string }>({
                stream: assertBody(initialResponse),
                parse: async (val: unknown) => val as { msg: string },
                eventShape: { type: "sse", streamTerminator: "[DONE]", resumable: true },
                reconnectionEnabled: true,
                maxReconnectionAttempts: 3,
                reconnect,
            });

            const messages: { msg: string }[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            assert.deepStrictEqual(messages, [{ msg: "first" }, { msg: "second" }]);
            assert.strictEqual(connectionTimestamps.length, 2);

            const delayMs = at(connectionTimestamps, 1) - at(connectionTimestamps, 0);
            // Should have waited at least ~150ms (allowing 30ms variance for network)
            assert.ok(delayMs >= 120, `Expected delay >= 120ms, got ${delayMs}ms`);

            console.log(`✓ Server retry directive respected: reconnected after ${delayMs}ms (retry: 150)`);
        } finally {
            await closeServer(server);
        }
    });

    test("stops after maxReconnectionAttempts when server sends no new data", async () => {
        let connectionCount = 0;

        const { server, port } = await createSseServer((req, res) => {
            connectionCount++;
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });

            if (connectionCount === 1) {
                // First connection: send one event, then drop
                res.write("id: evt-1\ndata: {\"n\": 1}\n\n");
                res.end();
            } else {
                // All reconnection attempts: immediately close without sending data
                // This simulates a server that's completely down on reconnect
                res.end();
            }
        });

        try {
            const url = `http://127.0.0.1:${port}/sse`;
            const initialResponse = await fetch(url);

            const reconnect = async (lastEventId: string): Promise<ReadableStream> => {
                const response = await fetch(url, {
                    headers: { "Last-Event-ID": lastEventId },
                });
                return assertBody(response);
            };

            const stream = new Stream<{ n: number }>({
                stream: assertBody(initialResponse),
                parse: async (val: unknown) => val as { n: number },
                eventShape: { type: "sse", streamTerminator: "[DONE]", resumable: true },
                reconnectionEnabled: true,
                maxReconnectionAttempts: 2, // Allow only 2 reconnect attempts
                reconnect,
            });

            const messages: { n: number }[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            // Got only the event from the first connection
            assert.deepStrictEqual(messages, [{ n: 1 }]);
            // 1 initial + 2 reconnect attempts = 3 total connections
            assert.strictEqual(connectionCount, 3);

            console.log("✓ Stops after maxReconnectionAttempts=2: server down on reconnect, stream ends gracefully");
        } finally {
            await closeServer(server);
        }
    });

    test("does not reconnect when reconnectionEnabled is false", async () => {
        let connectionCount = 0;

        const { server, port } = await createSseServer((req, res) => {
            connectionCount++;
            res.writeHead(200, {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
            });
            res.write("id: 1\ndata: {\"only\": true}\n\n");
            res.end(); // drop without terminator
        });

        try {
            const url = `http://127.0.0.1:${port}/sse`;
            const initialResponse = await fetch(url);

            const reconnect = async (lastEventId: string): Promise<ReadableStream> => {
                const response = await fetch(url, {
                    headers: { "Last-Event-ID": lastEventId },
                });
                return assertBody(response);
            };

            const stream = new Stream<{ only: boolean }>({
                stream: assertBody(initialResponse),
                parse: async (val: unknown) => val as { only: boolean },
                eventShape: { type: "sse", streamTerminator: "[DONE]", resumable: true },
                reconnectionEnabled: false, // Disabled!
                maxReconnectionAttempts: 5,
                reconnect,
            });

            const messages: { only: boolean }[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            assert.strictEqual(connectionCount, 1); // No reconnection attempt
            assert.deepStrictEqual(messages, [{ only: true }]);

            console.log("✓ reconnectionEnabled=false prevents reconnection");
        } finally {
            await closeServer(server);
        }
    });
});
