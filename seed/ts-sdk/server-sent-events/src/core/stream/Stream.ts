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
        discriminated?: boolean;
    }
}

const DATA_PREFIX = "data:";
const EVENT_PREFIX = "event:";
const ID_PREFIX = "id:";

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
    private discriminated: boolean;
    private controller: AbortController = new AbortController();
    private decoder: TextDecoder | undefined;

    constructor({ stream, parse, eventShape, signal }: Stream.Args & { parse: (val: unknown) => Promise<T> }) {
        this.stream = stream;
        this.parse = parse;
        this.discriminated = false;
        if (eventShape.type === "sse") {
            this.prefix = DATA_PREFIX;
            this.messageTerminator = "\n";
            this.streamTerminator = eventShape.streamTerminator;
            this.discriminated = eventShape.discriminated ?? false;
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
        if (this.discriminated) {
            yield* this.iterDiscriminatedMessages();
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

    private async *iterDiscriminatedMessages(): AsyncGenerator<T, void> {
        this.controller.signal;
        const stream = readableStreamAsyncIterable<any>(this.stream);
        let buf = "";
        let eventType: string | undefined;
        let dataValue: string | undefined;
        let idValue: string | undefined;

        for await (const chunk of stream) {
            buf += this.decodeChunk(chunk);

            let terminatorIndex: number;
            while ((terminatorIndex = buf.indexOf("\n")) >= 0) {
                const line = buf.slice(0, terminatorIndex);
                buf = buf.slice(terminatorIndex + 1);

                if (!line.trim()) {
                    if (dataValue != null) {
                        if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
                            return;
                        }
                        let parsedData: unknown = dataValue;
                        try {
                            parsedData = JSON.parse(dataValue);
                        } catch (_e) {
                            // data is not JSON, keep as string
                        }
                        const envelope: Record<string, unknown> =
                            typeof parsedData === "object" && parsedData !== null
                                ? { ...(parsedData as Record<string, unknown>) }
                                : { data: parsedData };
                        if (eventType != null) {
                            envelope.event = eventType;
                        }
                        if (idValue != null) {
                            envelope.id = idValue;
                        }
                        const message = await this.parse(envelope);
                        yield message;
                    }
                    eventType = undefined;
                    dataValue = undefined;
                    idValue = undefined;
                    continue;
                }

                if (line.startsWith(EVENT_PREFIX)) {
                    eventType = line.slice(EVENT_PREFIX.length).trim();
                } else if (line.startsWith(DATA_PREFIX)) {
                    dataValue = line.slice(DATA_PREFIX.length).trim();
                } else if (line.startsWith(ID_PREFIX)) {
                    idValue = line.slice(ID_PREFIX.length).trim();
                }
            }
        }

        if (dataValue != null) {
            if (this.streamTerminator != null && dataValue.includes(this.streamTerminator)) {
                return;
            }
            let parsedData: unknown = dataValue;
            try {
                parsedData = JSON.parse(dataValue);
            } catch (_e) {
                // data is not JSON, keep as string
            }
            const envelope: Record<string, unknown> =
                typeof parsedData === "object" && parsedData !== null
                    ? { ...(parsedData as Record<string, unknown>) }
                    : { data: parsedData };
            if (eventType != null) {
                envelope.event = eventType;
            }
            if (idValue != null) {
                envelope.id = idValue;
            }
            const message = await this.parse(envelope);
            yield message;
        }
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
