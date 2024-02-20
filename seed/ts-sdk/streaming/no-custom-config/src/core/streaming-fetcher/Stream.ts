import { Readable } from "node:stream";
import { ReadableStream } from "stream/web";

export class Stream<T> implements AsyncIterable<T> {
    private stream: Readable | ReadableStream;
    private parse: (val: unknown) => Promise<T>;
    private terminator: string;

    constructor({
        stream,
        parse,
        terminator,
    }: {
        stream: Readable | ReadableStream;
        parse: (val: unknown) => Promise<T>;
        terminator: string;
    }) {
        this.stream = stream;
        this.parse = parse;
        this.terminator = terminator;
    }

    private async *iterMessages(): AsyncGenerator<T, void> {
        const decoder = new TextDecoder("utf8");
        const stream = readableStreamAsyncIterable<any>(this.stream);
        let previous = "";
        for await (const chunk of stream) {
            let bufferChunk = "";
            // Buffer is present in Node.js environment
            if (typeof Buffer !== "undefined") {
                bufferChunk += Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            }
            // TextDecoder is present in Browser environment
            else if (typeof TextDecoder !== "undefined") {
                bufferChunk += decoder.decode(chunk);
            }
            previous += bufferChunk;
            let terminatorIndex: number;
            while ((terminatorIndex = previous.indexOf(this.terminator)) >= 0) {
                const line = previous.slice(0, terminatorIndex).trimEnd();
                const message = await this.parse(JSON.parse(line));
                yield message;
                previous = previous.slice(terminatorIndex + 1);
            }
        }
    }

    async *[Symbol.asyncIterator](): AsyncIterator<T, void, unknown> {
        for await (const message of this.iterMessages()) {
            yield message;
        }
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
