<% if (streamType === "wrapper") { %>
import { Readable } from "stream";
<% } %>
import { Stream } from "../../../src/core/stream/Stream";

describe("Stream", () => {
    describe("JSON streaming", () => {
        it("should parse single JSON message", async () => {
            const mockStream = createReadableStream(['{"value": 1}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }]);
        });

        it("should parse multiple JSON messages", async () => {
            const mockStream = createReadableStream(['{"value": 1}\n{"value": 2}\n{"value": 3}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
        });

        it("should handle messages split across chunks", async () => {
            const mockStream = createReadableStream(['{"val', 'ue": 1}\n{"value":', ' 2}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }, { value: 2 }]);
        });

        it("should skip empty lines", async () => {
            const mockStream = createReadableStream(['{"value": 1}\n\n\n{"value": 2}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }, { value: 2 }]);
        });

        it("should handle custom message terminator", async () => {
            const mockStream = createReadableStream(['{"value": 1}|||{"value": 2}|||']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "|||" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }, { value: 2 }]);
        });
    });

    describe("SSE streaming", () => {
        it("should parse SSE data with prefix", async () => {
            const mockStream = createReadableStream(['data: {"value": 1}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "sse" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }]);
        });

        it("should parse multiple SSE events", async () => {
            const mockStream = createReadableStream([
                'data: {"value": 1}\ndata: {"value": 2}\ndata: {"value": 3}\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "sse" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
        });

        it("should stop at stream terminator", async () => {
            const mockStream = createReadableStream([
                'data: {"value": 1}\ndata: [DONE]\ndata: {"value": 2}\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "sse", streamTerminator: "[DONE]" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }]);
        });

        it("should skip lines without data prefix", async () => {
            const mockStream = createReadableStream([
                'event: message\ndata: {"value": 1}\nid: 123\ndata: {"value": 2}\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "sse" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }, { value: 2 }]);
        });
    });

    describe("SSE event-level discrimination (inject discriminator)", () => {
        it("should inject event type as discriminator into JSON data", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"content": "hello"}\n\nevent: completion\ndata: {"content": "world"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([
                { type: "completion", content: "hello" },
                { type: "completion", content: "world" },
            ]);
        });

        it("should inject different event types for mixed events", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"content": "hi"}\n\nevent: error\ndata: {"message": "fail"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "event" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([
                { event: "completion", content: "hi" },
                { event: "error", message: "fail" },
            ]);
        });

        it("should not inject if data already contains discriminator key", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"type": "existing", "content": "hello"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "existing", content: "hello" }]);
        });

        it("should not false-positive when discriminator key appears inside a value", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"description": "type: foo", "content": "hello"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "completion", description: "type: foo", content: "hello" }]);
        });

        it("should not inject if no event field is present", async () => {
            const mockStream = createReadableStream([
                'data: {"content": "hello"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ content: "hello" }]);
        });

        it("should handle empty JSON object", async () => {
            const mockStream = createReadableStream([
                'event: heartbeat\ndata: {}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "heartbeat" }]);
        });

        it("should stop at stream terminator", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"content": "hi"}\n\nevent: done\ndata: [DONE]\n\nevent: completion\ndata: {"content": "bye"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type", streamTerminator: "[DONE]" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "completion", content: "hi" }]);
        });

        it("should concatenate multiline data fields", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"delta":\ndata: "hello"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "completion", delta: "hello" }]);
        });

        it("should handle events split across chunks", async () => {
            const mockStream = createReadableStream([
                'event: comple',
                'tion\ndata: {"con',
                'tent": "hi"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "completion", content: "hi" }]);
        });

        it("should handle last event without trailing blank line", async () => {
            const mockStream = createReadableStream([
                'event: completion\ndata: {"content": "hi"}\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "completion", content: "hi" }]);
        });

        it("should handle CRLF line endings", async () => {
            const mockStream = createReadableStream([
                'event: completion\r\ndata: {"content": "hi"}\r\n\r\nevent: completion\r\ndata: {"content": "world"}\r\n\r\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([
                { type: "completion", content: "hi" },
                { type: "completion", content: "world" },
            ]);
        });

        it("should inject empty string discriminator when event field is present but empty", async () => {
            const mockStream = createReadableStream([
                'event: \ndata: {"content": "hello"}\n\n',
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val,
                eventShape: { type: "sse", eventDiscriminator: "type" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ type: "", content: "hello" }]);
        });
    });

    describe("encoding and decoding", () => {
        it("should decode UTF-8 text using TextDecoder", async () => {
            const encoder = new TextEncoder();
            const mockStream = createReadableStream([encoder.encode('{"text": "café"}\n')]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { text: string },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ text: "café" }]);
        });

        it("should decode emoji correctly", async () => {
            const encoder = new TextEncoder();
            const mockStream = createReadableStream([encoder.encode('{"emoji": "🎉"}\n')]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { emoji: string },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ emoji: "🎉" }]);
        });

        it("should handle binary data chunks", async () => {
            const encoder = new TextEncoder();
            const mockStream = createReadableStream([
                encoder.encode('{"val'),
                encoder.encode('ue": 1}\n'),
            ]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }]);
        });

        it("should handle multi-byte UTF-8 characters split across chunk boundaries", async () => {
            // Test string with Japanese (3 bytes), Russian (2 bytes), German (2 bytes), and Chinese (3 bytes)
            const testString = '{"text": "こんにちは Привет Größe 你好"}\n';
            const fullBytes = new TextEncoder().encode(testString);

            // Split the bytes in the middle of multi-byte characters
            // Japanese "こ" starts at byte 11, is 3 bytes (E3 81 93)
            // Split after first byte of "こ" to test mid-character splitting
            const splitPoint = 12; // This splits "こ" in the middle
            const chunk1 = fullBytes.slice(0, splitPoint);
            const chunk2 = fullBytes.slice(splitPoint);

            const mockStream = createReadableStream([chunk1, chunk2]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { text: string },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ text: "こんにちは Привет Größe 你好" }]);
        });
    });

    describe("abort signal", () => {
        it("should handle abort signal", async () => {
            const controller = new AbortController();
            const mockStream = createReadableStream(['{"value": 1}\n{"value": 2}\n{"value": 3}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
                signal: controller.signal,
            });

            const messages: unknown[] = [];
            let count = 0;
            for await (const message of stream) {
                messages.push(message);
                count++;
                if (count === 2) {
                    controller.abort();
                    break;
                }
            }

            expect(messages.length).toBe(2);
        });
    });

    describe("async iteration", () => {
        it("should support async iterator protocol", async () => {
            const mockStream = createReadableStream(['{"value": 1}\n{"value": 2}\n']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const iterator = stream[Symbol.asyncIterator]();
            const first = await iterator.next();
            expect(first.done).toBe(false);
            expect(first.value).toEqual({ value: 1 });

            const second = await iterator.next();
            expect(second.done).toBe(false);
            expect(second.value).toEqual({ value: 2 });

            const third = await iterator.next();
            expect(third.done).toBe(true);
        });
    });

    describe("edge cases", () => {
        it("should handle empty stream", async () => {
            const mockStream = createReadableStream([]);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([]);
        });

        it("should handle stream with only whitespace", async () => {
            const mockStream = createReadableStream(['   \n\n\t\n   ']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([]);
        });

        it("should handle incomplete message at end of stream", async () => {
            const mockStream = createReadableStream(['{"value": 1}\n{"incomplete']);
            const stream = new Stream({
                stream: mockStream,
                parse: async (val: unknown) => val as { value: number },
                eventShape: { type: "json", messageTerminator: "\n" },
            });

            const messages: unknown[] = [];
            for await (const message of stream) {
                messages.push(message);
            }

            expect(messages).toEqual([{ value: 1 }]);
        });
    });
});

// Helper function to create a ReadableStream from string chunks
function createReadableStream(chunks: (string | Uint8Array)[]): <% if (streamType === "wrapper") { %>Readable | <% } %>ReadableStream {
<% if (streamType === "wrapper") { %>
    // For wrapper type, return Node.js Readable stream
    const readable = new Readable({
        read() {
            for (const chunk of chunks) {
                this.push(typeof chunk === "string" ? chunk : Buffer.from(chunk));
            }
            this.push(null);
        },
    });
    return readable;
<% } else { %>
    // For standard type, return ReadableStream
    let index = 0;
    return new ReadableStream({
        pull(controller) {
            if (index < chunks.length) {
                const chunk = chunks[index++];
                controller.enqueue(typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk);
            } else {
                controller.close();
            }
        },
    });
<% } %>
}
