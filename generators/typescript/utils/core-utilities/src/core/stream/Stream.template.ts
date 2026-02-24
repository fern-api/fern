<% if (streamType === "wrapper") { %>
import { Readable } from "stream";
<% } %>

import { RUNTIME } from "../runtime";

export declare namespace Stream {
    interface Args {
        /**
         * The HTTP response stream to read from.
         */
        <% if (streamType === "wrapper") { %>
        stream: Readable | ReadableStream;
        <% } else { %>
        stream: ReadableStream;
        <% } %>
        /**
         * The event shape to use for parsing the stream data.
         */
        eventShape: JsonEvent | SseEvent;
        /**
         * An abort signal to stop the stream.
         */
        signal?: AbortSignal;
    }

    interface JsonEvent {
        type: "json";
        messageTerminator: string;
    }

    interface SseEvent {
        type: "sse";
        streamTerminator?: string;
        eventDiscriminator?: string;
    }
}

const DATA_PREFIX = "data:";
const EVENT_PREFIX = "event:";

export class Stream<T> implements AsyncIterable<T> {
    <% if (streamType === "wrapper") { %>
    private stream: Readable | ReadableStream;
    <% } else { %>
    private stream: ReadableStream;
    <% } %>
    private parse: (val: unknown) => Promise<T>;
    /**
     * The prefix to use for each message. For example,
     * for SSE, the prefix is "data: ".
     */
    private prefix: string | undefined;
    private messageTerminator: string;
    private streamTerminator: string | undefined;
    private eventDiscriminator: string | undefined;
    private controller: AbortController = new AbortController();
    private decoder: TextDecoder | undefined;

    constructor({ stream, parse, eventShape, signal }: Stream.Args & { parse: (val: unknown) => Promise<T> }) {
        this.stream = stream;
        this.parse = parse;
        if (eventShape.type === "sse") {
            this.prefix = DATA_PREFIX;
            this.messageTerminator = "\n";
            this.streamTerminator = eventShape.streamTerminator;
            this.eventDiscriminator = eventShape.eventDiscriminator;
        } else {
            this.messageTerminator = eventShape.messageTerminator;
        }
        signal?.addEventListener("abort", () => this.controller.abort());

        // Initialize shared TextDecoder
        if (typeof TextDecoder !== "undefined") {
            this.decoder = new TextDecoder("utf-8");
        }
    }

    private async *iterMessages(): AsyncGenerator<T, void> {
        if (this.eventDiscriminator != null) {
            yield* this.iterSseEvents();
        } else {
            yield* this.iterDataMessages();
        }
    }

    private async *iterDataMessages(): AsyncGenerator<T, void> {
        this.controller.signal;
        const stream = readableStreamAsyncIterable<any>(this.stream);
        let buf = "";
        let prefixSeen = false;
        for await (const chunk of stream) {
            buf += this.decodeChunk(chunk);

            let terminatorIndex: number;
            while ((terminatorIndex = buf.indexOf(this.messageTerminator)) >= 0) {
                let line = buf.slice(0, terminatorIndex);
                buf = buf.slice(terminatorIndex + this.messageTerminator.length);

                if (!line.trim()) {
                    continue;
                }

                if (!prefixSeen && this.prefix != null) {
                    const prefixIndex = line.indexOf(this.prefix);
                    if (prefixIndex === -1) {
                        continue;
                    }
                    prefixSeen = true;
                    line = line.slice(prefixIndex + this.prefix.length);
                }

                if (this.streamTerminator != null && line.includes(this.streamTerminator)) {
                    return;
                }
                const message = await this.parse(JSON.parse(line));
                yield message;
                prefixSeen = false;
            }
        }
    }

    private async *iterSseEvents(): AsyncGenerator<T, void> {
        const stream = readableStreamAsyncIterable<any>(this.stream);
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
                        if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
                            return;
                        }
                        const data = this.injectDiscriminator(dataValue, eventType);
                        const message = await this.parse(JSON.parse(data));
                        yield message;
                    }
                    eventType = undefined;
                    dataValue = undefined;
                    continue;
                }

                if (line.startsWith(EVENT_PREFIX)) {
                    eventType = line.slice(EVENT_PREFIX.length).trim();
                } else if (line.startsWith(DATA_PREFIX)) {
                    const val = line.slice(DATA_PREFIX.length).trim();
                    dataValue = dataValue != null ? dataValue + "\n" + val : val;
                }
            }
        }

        if (dataValue != null) {
            if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
                return;
            }
            const data = this.injectDiscriminator(dataValue, eventType);
            const message = await this.parse(JSON.parse(data));
            yield message;
        }
    }

    private injectDiscriminator(data: string, eventType: string | undefined): string {
        if (this.eventDiscriminator == null || eventType == null) {
            return data;
        }
        const trimmed = data.trim();
        if (trimmed.length === 0 || trimmed[0] !== "{") {
            return data;
        }
        const quotedField = JSON.stringify(this.eventDiscriminator);
        if (data.includes(quotedField + ":") || data.includes(quotedField + " :")) {
            return data;
        }
        const injected = quotedField + ":" + JSON.stringify(eventType);
        const openIdx = data.indexOf("{");
        const after = data.slice(openIdx + 1);
        const afterTrimmed = after.trim();
        if (afterTrimmed.length === 0 || afterTrimmed[0] === "}") {
            return data.slice(0, openIdx + 1) + injected + after;
        }
        return data.slice(0, openIdx + 1) + injected + "," + after;
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T, void, unknown> {
        for await (const message of this.iterMessages()) {
            yield message;
        }
    }

    private decodeChunk(chunk: any): string {
        let decoded = "";
        // If TextDecoder is available, use the streaming decoder instance
        if (this.decoder != null) {
            decoded += this.decoder.decode(chunk, { stream: true });
        }
        // Buffer is present in Node.js environment
        else if (RUNTIME.type === "node" && typeof chunk !== "undefined") {
            decoded += Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        }
        return decoded;
    }
}

/**
 * Browser polyfill for ReadableStream
 */
// biome-ignore lint/suspicious/noExplicitAny: allow explicit any
export function readableStreamAsyncIterable<T>(stream: any): AsyncIterableIterator<T> {
    if (stream[Symbol.asyncIterator]) {
        return stream;
    }

    const reader = stream.getReader();
    return {
        async next() {
            try {
                const result = await reader.read();
                if (result?.done) {
                    reader.releaseLock();
                } // release lock when stream becomes closed
                return result;
            } catch (e) {
                reader.releaseLock(); // release lock when stream becomes errored
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
        }
    };
}
