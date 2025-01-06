/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jest/no-disabled-tests */
import { Stream, fetcher, newFormData } from "@fern-typescript/fetcher";
import * as fs from "fs";
import path from "path";
import * as stream from "stream";

describe("Fetcher Tests", () => {
    it.skip("Test if making a request works", async () => {
        const response = await fetcher({
            url: "https://google.com",
            method: "GET"
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((response as any)?.ok).toEqual(true);
    }, 90_000);

    it.skip("Formdata request", async () => {
        const file = fs.createReadStream(path.join(__dirname, "addresses.csv"));

        const formData = await newFormData();
        formData.append("data", file);

        const { headers, body } = await formData.getRequest();
        const response = await fetcher({
            url: "https://api.cohere.ai/v1/datasets",
            method: "POST",
            headers: {
                Authorization: "Bearer <>",
                ...headers
            },
            queryParameters: {
                name: "my-dataset",
                type: "embed-input"
            },
            body
        });
        expect((response as any)?.ok).toEqual(true);
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
                message: "Write a very short poem about devtools",
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

    it.skip("SSE", async () => {
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
                model: "meta-llama-3-8b-instruct",
                max_tokens: 100,
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
                type: "sse",
                streamTerminator: "[DONE]"
            }
        });

        for await (const message of stream) {
            // eslint-disable-next-line no-console
            process.stdout.write(JSON.stringify(message));
        }
    }, 90_000);

    it.skip("abort while making request", async () => {
        const controller = new AbortController();
        const call = fetcher<stream.Readable>({
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
            },
            // timeoutMs: 10,
            abortSignal: controller.signal
        });
        controller.abort();
        const response = await call;
        expect(response.ok).toEqual(false);
        if (response.ok) {
            throw new Error("Expected response to fail");
        }
        expect(response.error.reason === "unknown" && response.error.errorMessage.includes("aborted")).toBe(true);
    }, 90_000);

    it.skip("abort while streaming events", async () => {
        const controller = new AbortController();
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
            },
            // timeoutMs: 10,
            abortSignal: controller.signal
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
        let i = 1;
        await expect(async () => {
            for await (const event of stream) {
                if (i === 10) {
                    controller.abort();
                    // expect(controller.abort()).toThrow();
                }
                // eslint-disable-next-line no-console
                console.log(JSON.stringify(event));
                i += 1;
            }
        }).rejects.toThrow();
    }, 90_000);
});
