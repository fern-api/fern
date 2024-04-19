/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-disabled-tests */
import { fetcher, Stream } from "@fern-typescript/fetcher";
import * as stream from "stream";

describe("Fetcher Tests", () => {
    it.skip("Test if making a request works", async () => {
        const response = await fetcher({
            url: "https://google.com",
            method: "GET"
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((response as any)?.error?.statusCode).toEqual(200);
    }, 90_000);

    it.skip("JSON streaming", async () => {
        const response = await fetcher<stream.Readable>({
            url: "https://api.cohere.ai/v1/chat",
            method: "POST",
            responseType: "streaming",
            headers: {
                Authorization: "Bearer <>",
                "Content-Type": "application/json"
            },
            body: {
                message: "Write a long essay about devtools",
                stream: true
            }
        });
        expect(response.ok).toEqual(true);
        if (!response.ok) {
            throw new Error("Response failed");
        }
        const stream = new Stream<unknown>({
            stream: response.body,
            parse: async (data) => data,
            eventShape: {
                type: "json",
                messageTerminator: "\n"
            }
        });
        for await (const message of stream) {
            process.stdout.write("event");
            // eslint-disable-next-line no-console
            process.stdout.write(JSON.stringify(message));
        }
    }, 90_000);

    it("SSE", async () => {
        const response = await fetcher<stream.Readable>({
            url: "https://text.octoai.run/v1/chat/completions",
            method: "POST",
            responseType: "streaming",
            headers: {
                Authorization: "Bearer <>",
                "Content-Type": "application/json"
            },
            body: {
                messages: [
                    {
                        role: "system",
                        content: "Write a long essay about devtools"
                    }
                ],
                model: "qwen1.5-32b-chat",
                max_tokens: 22105,
                presence_penalty: 0,
                temperature: 0.1,
                top_p: 0.9,
                stream: true
            }
        });
        expect(response.ok).toEqual(true);
        if (!response.ok) {
            throw new Error("Response failed");
        }
        const stream = new Stream<unknown>({
            stream: response.body,
            parse: async (data) => data,
            eventShape: {
                type: "sse"
            }
        });
        for await (const message of stream) {
            process.stdout.write("event");
            // eslint-disable-next-line no-console
            process.stdout.write(JSON.stringify(message));
        }
    }, 90_000);
});
