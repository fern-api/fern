import { Readable } from "stream";
import { RUNTIME } from "../runtime";

export declare namespace Stream {
    interface Args {
        /**
         * The HTTP response stream to read from.
         */
        stream: Readable | ReadableStream;
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
    }
}

const DATA_PREFIX = "data:";

export class Stream<T> implements AsyncIterable<T> {
    private stream: Readable | ReadableStream;
    private parse: (val: unknown) => Promise<T>;
    /**
     * The prefix to use for each message. For example,
     * for SSE, the prefix is "data: ".
     */
    private prefix: string | undefined;
    private messageTerminator: string;
    private streamTerminator: string | undefined;
    private controller: AbortController = new AbortController();

    constructor({ stream, parse, eventShape, signal }: Stream.Args & { parse: (val: unknown) => Promise<T> }) {
        this.stream = stream;
        this.parse = parse;
        if (eventShape.type === "sse") {
            this.prefix = DATA_PREFIX;
            this.messageTerminator = "\n";
            this.streamTerminator = eventShape.streamTerminator;
        } else {
            this.messageTerminator = eventShape.messageTerminator;
        }
        signal?.addEventListener("abort", () => this.controller.abort());
    }

    private async *iterMessages(): AsyncGenerator<T, void> {
        this.controller.signal;
        const stream = readableStreamAsyncIterable<any>(this.stream);
        let buf = "";
        let prefixSeen = false;
        for await (const chunk of stream) {
            buf += this.decodeChunk(chunk);

            let terminatorIndex: number;
            // Parse the chunk into as many messages as possible
            while ((terminatorIndex = buf.indexOf(this.messageTerminator)) >= 0) {
                // Extract the line from the buffer
                let line = buf.slice(0, terminatorIndex + 1);
                buf = buf.slice(terminatorIndex + 1);

                // Skip empty lines
                if (line.length === 0) {
                    continue;
                }

                // Skip the chunk until the prefix is found
                if (!prefixSeen && this.prefix != null) {
                    const prefixIndex = line.indexOf(this.prefix);
                    if (prefixIndex === -1) {
                        continue;
                    }
                    prefixSeen = true;
                    line = line.slice(prefixIndex + this.prefix.length);
                }

                // If the stream terminator is present, return
                if (this.streamTerminator != null && line.includes(this.streamTerminator)) {
                    return;
                }

                // Otherwise, yield message from the prefix to the terminator
                const message = await this.parse(JSON.parse(line));
                yield message;
                prefixSeen = false;
            }
        }
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T, void, unknown> {
        for await (const message of this.iterMessages()) {
            yield message;
        }
    }

    private decodeChunk(chunk: any): string {
        let decoded = "";
        // Buffer is present in Node.js environment
        if (RUNTIME.type === "node" && typeof chunk != "undefined") {
            decoded += Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        }
        // TextDecoder is present in Browser environment
        else if (RUNTIME.type === "browser" && typeof TextDecoder !== "undefined") {
            const decoder = new TextDecoder("utf8");
            decoded += decoder.decode(chunk);
        }
        return decoded;
    }
}

/**
 * Browser polyfill for ReadableStream
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
