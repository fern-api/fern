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
        let previous = "";
        for await (const chunk of this.stream) {
            const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
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
