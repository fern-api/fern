import { fromJson } from "../json.js";
import { RUNTIME } from "../runtime/index.js";

export declare namespace Stream {
    interface Args {
        /**
         * The HTTP response stream to read from.
         */

        stream: ReadableStream;

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

    /**
     * Represents a parsed Server-Sent Event with metadata.
     */
    interface ServerSentEvent<T> {
        data: T;
        event?: string;
        eventId?: string;
        retry?: number;
    }
}

const DATA_PREFIX = "data:";
const EVENT_PREFIX = "event:";
const ID_PREFIX = "id:";
const RETRY_PREFIX = "retry:";

export class Stream<T> implements AsyncIterable<T> {
    private stream: ReadableStream;

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
    private _lastEventId: string | undefined;

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

    /**
     * The ID of the last SSE event received, per the SSE spec.
     * Persists across events and is updated when an `id:` field is parsed.
     */
    get lastEventId(): string | undefined {
        return this._lastEventId;
    }

    /**
     * Iterates over full SSE events including metadata (event, id, retry).
     * This is the SSE-aware counterpart of the default async iteration which only yields parsed data.
     */
    async *events(): AsyncGenerator<Stream.ServerSentEvent<T>, void> {
        yield* this.iterFullEvents();
    }

    private async *iterMessages(): AsyncGenerator<T, void> {
        for await (const event of this.iterFullEvents()) {
            yield event.data;
        }
    }

    private async *iterFullEvents(): AsyncGenerator<Stream.ServerSentEvent<T>, void> {
        if (this.eventDiscriminator != null) {
            yield* this.iterSseEvents();
        } else {
            yield* this.iterDataMessages();
        }
    }

    private async *iterDataMessages(): AsyncGenerator<Stream.ServerSentEvent<T>, void> {
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

                if (this.prefix != null && line.startsWith(ID_PREFIX)) {
                    const val = line.slice(ID_PREFIX.length).trim();
                    if (!val.includes("\0")) {
                        this._lastEventId = val;
                    }
                    continue;
                }

                if (this.prefix != null && line.startsWith(RETRY_PREFIX)) {
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
                const message = await this.parse(fromJson(line));
                yield {
                    data: message,
                    eventId: this._lastEventId,
                };
                prefixSeen = false;
            }
        }
    }

    private async *iterSseEvents(): AsyncGenerator<Stream.ServerSentEvent<T>, void> {
        const stream = readableStreamAsyncIterable<any>(this.stream);
        let buf = "";
        let eventType: string | undefined;
        let dataValue: string | undefined;
        let retryValue: number | undefined;

        for await (const chunk of stream) {
            buf += this.decodeChunk(chunk);

            let terminatorIndex: number;
            while ((terminatorIndex = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, terminatorIndex).replace(/\r$/, "");
                buf = buf.slice(terminatorIndex + 1);

                if (!line.trim()) {
                    if (dataValue != null) {
                        const parsed = await this.dispatchSseEvent(dataValue, eventType);
                        if (parsed == null) {
                            return;
                        }
                        yield {
                            data: parsed,
                            event: eventType,
                            eventId: this._lastEventId,
                            retry: retryValue,
                        };
                    }
                    eventType = undefined;
                    dataValue = undefined;
                    retryValue = undefined;
                    continue;
                }

                if (line.startsWith(EVENT_PREFIX)) {
                    eventType = line.slice(EVENT_PREFIX.length).trim();
                } else if (line.startsWith(DATA_PREFIX)) {
                    const val = line.slice(DATA_PREFIX.length).trim();
                    dataValue = dataValue != null ? `${dataValue}\n${val}` : val;
                } else if (line.startsWith(ID_PREFIX)) {
                    const val = line.slice(ID_PREFIX.length).trim();
                    if (!val.includes("\0")) {
                        this._lastEventId = val;
                    }
                } else if (line.startsWith(RETRY_PREFIX)) {
                    const val = parseInt(line.slice(RETRY_PREFIX.length).trim(), 10);
                    if (!Number.isNaN(val)) {
                        retryValue = val;
                    }
                }
            }
        }

        if (dataValue != null) {
            const parsed = await this.dispatchSseEvent(dataValue, eventType);
            if (parsed != null) {
                yield {
                    data: parsed,
                    event: eventType,
                    eventId: this._lastEventId,
                    retry: retryValue,
                };
            }
        }
    }

    /**
     * Parses and returns a single SSE event, or returns null if the event is a stream terminator.
     */
    private async dispatchSseEvent(dataValue: string, eventType: string | undefined): Promise<T | null> {
        if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
            return null;
        }
        return this.parse(this.injectDiscriminator(fromJson(dataValue), eventType));
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
        },
    };
}
