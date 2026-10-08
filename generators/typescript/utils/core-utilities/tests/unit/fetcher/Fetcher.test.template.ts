import fs from "fs";
import { join } from "path";
import stream from "stream";
import type { BinaryResponse } from "../../../src/core";
import { type Fetcher, fetcherImpl } from "../../../src/core/fetcher/Fetcher";

describe("Test fetcherImpl", () => {
    it("should handle successful request", async () => {
        const mockArgs: Fetcher.Args = {
            url: "https://httpbin.org/post",
            method: "POST",
            headers: { "X-Test": "x-test-header" },
            body: { data: "test" },
            contentType: "application/json",
            requestType: "json",
            maxRetries: 0,
            responseType: "json",
        };

        global.fetch = jest.fn().mockResolvedValue(
            new Response(JSON.stringify({ data: "test" }), {
                status: 200,
                statusText: "OK",
            }),
        );

        const result = await fetcherImpl(mockArgs);
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body).toEqual({ data: "test" });
        }

        expect(global.fetch).toHaveBeenCalledWith(
            "https://httpbin.org/post",
            expect.objectContaining({
                method: "POST",
                headers: expect.toContainHeaders({ "X-Test": "x-test-header" }),
                body: JSON.stringify({ data: "test" }),
            }),
        );
    });

    it("should send octet stream", async () => {
        const url = "https://httpbin.org/post/file";
        const mockArgs: Fetcher.Args = {
            url,
            method: "POST",
            headers: { "X-Test": "x-test-header" },
            contentType: "application/octet-stream",
            requestType: "bytes",
            maxRetries: 0,
            responseType: "json",
            body: fs.createReadStream(join(__dirname, "test-file.txt")),
        };

        global.fetch = jest.fn().mockResolvedValue(
            new Response(JSON.stringify({ data: "test" }), {
                status: 200,
                statusText: "OK",
            }),
        );

        const result = await fetcherImpl(mockArgs);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: "POST",
                headers: expect.toContainHeaders({ "X-Test": "x-test-header" }),
                body: expect.any(fs.ReadStream),
            }),
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.body).toEqual({ data: "test" });
        }
    });


<% if (fileResponseType === "binary-response") { %>
    it("should receive file as stream", async () => {
        const url = "https://httpbin.org/post/file";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            headers: { "X-Test": "x-test-header" },
            maxRetries: 0,
            responseType: "binary-response",
        };

        global.fetch = jest.fn().mockResolvedValue(
            new Response(
                stream.Readable.toWeb(fs.createReadStream(join(__dirname, "test-file.txt"))) as ReadableStream,
                {
                    status: 200,
                    statusText: "OK",
                },
            ),
        );

        const result = await fetcherImpl(mockArgs);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: "GET",
                headers: expect.toContainHeaders({ "X-Test": "x-test-header" }),
            }),
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            const body = result.body as BinaryResponse;
            expect(body).toBeDefined();
            expect(body.bodyUsed).toBe(false);
            expect(typeof body.stream).toBe("function");
            const stream = body.stream();
            expect(stream).toBeInstanceOf(ReadableStream);
            const readableStream = stream as ReadableStream;
            const reader = readableStream.getReader();
            const { value } = await reader.read();
            const decoder = new TextDecoder();
            const streamContent = decoder.decode(value);
            expect(streamContent.trim()).toBe("This is a test file!");
            expect(body.bodyUsed).toBe(true);
        }
    });

    it("should receive file as blob", async () => {
        const url = "https://httpbin.org/post/file";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            headers: { "X-Test": "x-test-header" },
            maxRetries: 0,
            responseType: "binary-response",
        };

        global.fetch = jest.fn().mockResolvedValue(
            new Response(
                stream.Readable.toWeb(fs.createReadStream(join(__dirname, "test-file.txt"))) as ReadableStream,
                {
                    status: 200,
                    statusText: "OK",
                },
            ),
        );

        const result = await fetcherImpl(mockArgs);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: "GET",
                headers: expect.toContainHeaders({ "X-Test": "x-test-header" }),
            }),
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            const body = result.body as BinaryResponse;
            expect(body).toBeDefined();
            expect(body.bodyUsed).toBe(false);
            expect(typeof body.blob).toBe("function");
            const blob = await body.blob();
            expect(blob).toBeInstanceOf(Blob);
            const reader = blob.stream().getReader();
            const { value } = await reader.read();
            const decoder = new TextDecoder();
            const streamContent = decoder.decode(value);
            expect(streamContent.trim()).toBe("This is a test file!");
            expect(body.bodyUsed).toBe(true);
        }
    });

    it("should receive file as arraybuffer", async () => {
        const url = "https://httpbin.org/post/file";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            headers: { "X-Test": "x-test-header" },
            maxRetries: 0,
            responseType: "binary-response",
        };

        global.fetch = jest.fn().mockResolvedValue(
            new Response(
                stream.Readable.toWeb(fs.createReadStream(join(__dirname, "test-file.txt"))) as ReadableStream,
                {
                    status: 200,
                    statusText: "OK",
                },
            ),
        );

        const result = await fetcherImpl(mockArgs);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: "GET",
                headers: expect.toContainHeaders({ "X-Test": "x-test-header" }),
            }),
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            const body = result.body as BinaryResponse;
            expect(body).toBeDefined();
            expect(body.bodyUsed).toBe(false);
            expect(typeof body.arrayBuffer).toBe("function");
            const arrayBuffer = await body.arrayBuffer();
            expect(arrayBuffer).toBeInstanceOf(ArrayBuffer);
            const decoder = new TextDecoder();
            const streamContent = decoder.decode(new Uint8Array(arrayBuffer));
            expect(streamContent.trim()).toBe("This is a test file!");
            expect(body.bodyUsed).toBe(true);
        }
    });

    it("should receive file as bytes", async () => {
        const url = "https://httpbin.org/post/file";
        const mockArgs: Fetcher.Args = {
            url,
            method: "GET",
            headers: { "X-Test": "x-test-header" },
            maxRetries: 0,
            responseType: "binary-response",
        };

        global.fetch = jest.fn().mockResolvedValue(
            new Response(
                stream.Readable.toWeb(fs.createReadStream(join(__dirname, "test-file.txt"))) as ReadableStream,
                {
                    status: 200,
                    statusText: "OK",
                },
            ),
        );

        const result = await fetcherImpl(mockArgs);

        expect(global.fetch).toHaveBeenCalledWith(
            url,
            expect.objectContaining({
                method: "GET",
                headers: expect.toContainHeaders({ "X-Test": "x-test-header" }),
            }),
        );
        expect(result.ok).toBe(true);
        if (result.ok) {
            const body = result.body as BinaryResponse;
            expect(body).toBeDefined();
            expect(body.bodyUsed).toBe(false);
            expect(typeof body.bytes).toBe("function");
            if (!body.bytes) {
                return;
            }
            const bytes = await body.bytes();
            expect(bytes).toBeInstanceOf(Uint8Array);
            const decoder = new TextDecoder();
            const streamContent = decoder.decode(bytes);
            expect(streamContent.trim()).toBe("This is a test file!");
            expect(body.bodyUsed).toBe(true);
        }
    });
<% } %>

    describe("authRefresh", () => {
        beforeEach(() => {
            jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
                process.nextTick(callback);
                return null as any;
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        // Header values captured at call time; the retry loop reuses the same Headers instance.
        let sentAuthorization: (string | null)[];
        let sentTestHeader: (string | null)[];

        function mockFetchResponses(...responses: Response[]): void {
            sentAuthorization = [];
            sentTestHeader = [];
            const fetchMock = jest.fn(async (_url: string, init: RequestInit) => {
                const headers = new Headers(init.headers);
                sentAuthorization.push(headers.get("Authorization"));
                sentTestHeader.push(headers.get("X-Test"));
                return responses[Math.min(sentAuthorization.length, responses.length) - 1];
            });
            global.fetch = fetchMock as unknown as typeof fetch;
        }

        it("should retry a 401 with refreshed auth headers", async () => {
            mockFetchResponses(
                new Response("", { status: 401 }),
                new Response(JSON.stringify({ data: "test" }), { status: 200 }),
            );
            const refresh = jest.fn().mockResolvedValue({ Authorization: "Bearer new-token" });

            const result = await fetcherImpl({
                url: "https://example.com/resource",
                method: "GET",
                headers: { Authorization: "Bearer old-token", "X-Test": "x-test-header" },
                maxRetries: 2,
                responseType: "json",
                authRefresh: { headers: { Authorization: "Bearer old-token" }, refresh },
            });

            expect(result.ok).toBe(true);
            expect(refresh).toHaveBeenCalledTimes(1);
            expect(global.fetch).toHaveBeenCalledTimes(2);
            expect(sentAuthorization).toEqual(["Bearer old-token", "Bearer new-token"]);
            expect(sentTestHeader).toEqual(["x-test-header", "x-test-header"]);
        });

        it("should pass the auth headers each failed attempt was sent with to refresh", async () => {
            mockFetchResponses(
                new Response("", { status: 401 }),
                new Response("", { status: 401 }),
                new Response(JSON.stringify({}), { status: 200 }),
            );
            const refresh = jest
                .fn()
                .mockResolvedValueOnce({ Authorization: "Bearer token-1" })
                .mockResolvedValueOnce({ Authorization: "Bearer token-2" });

            await fetcherImpl({
                url: "https://example.com/resource",
                method: "GET",
                headers: { Authorization: "Bearer token-0" },
                maxRetries: 2,
                responseType: "json",
                authRefresh: { headers: { Authorization: "Bearer token-0" }, refresh },
            });

            expect(refresh.mock.calls).toEqual([
                [{ Authorization: "Bearer token-0" }],
                [{ Authorization: "Bearer token-1" }],
            ]);
            expect(sentAuthorization).toEqual(["Bearer token-0", "Bearer token-1", "Bearer token-2"]);
        });

        it("should keep auth headers overridden by the caller", async () => {
            mockFetchResponses(new Response("", { status: 403 }), new Response(JSON.stringify({}), { status: 200 }));
            const refresh = jest.fn().mockResolvedValue({ Authorization: "Bearer new-token" });

            await fetcherImpl({
                url: "https://example.com/resource",
                method: "GET",
                headers: { Authorization: "Bearer request-override" },
                maxRetries: 2,
                responseType: "json",
                authRefresh: { headers: { Authorization: "Bearer old-token" }, refresh },
            });

            expect(refresh).toHaveBeenCalledTimes(1);
            expect(sentAuthorization).toEqual(["Bearer request-override", "Bearer request-override"]);
        });

        it("should keep a caller-supplied auth header when the initial auth headers were empty", async () => {
            mockFetchResponses(new Response("", { status: 401 }), new Response(JSON.stringify({}), { status: 200 }));
            const refresh = jest.fn().mockResolvedValue({ Authorization: "Bearer new-token" });

            await fetcherImpl({
                url: "https://example.com/resource",
                method: "GET",
                headers: { Authorization: "Bearer request-override" },
                maxRetries: 2,
                responseType: "json",
                authRefresh: { headers: {}, refresh },
            });

            expect(refresh).toHaveBeenCalledTimes(1);
            expect(sentAuthorization).toEqual(["Bearer request-override", "Bearer request-override"]);
        });

        it("should throw the refresh error without retrying the request", async () => {
            global.fetch = jest.fn().mockResolvedValue(new Response("", { status: 401 }));
            const refreshError = new Error("token endpoint failed");
            const refresh = jest.fn().mockRejectedValue(refreshError);

            await expect(
                fetcherImpl({
                    url: "https://example.com/resource",
                    method: "GET",
                    headers: { Authorization: "Bearer old-token" },
                    maxRetries: 2,
                    responseType: "json",
                    authRefresh: { headers: { Authorization: "Bearer old-token" }, refresh },
                }),
            ).rejects.toBe(refreshError);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it("should not retry a 401 when the request body is a stream", async () => {
            mockFetchResponses(new Response("", { status: 401 }), new Response(JSON.stringify({}), { status: 200 }));
            const refresh = jest.fn().mockResolvedValue({ Authorization: "Bearer new-token" });

            const result = await fetcherImpl({
                url: "https://example.com/upload",
                method: "POST",
                headers: { Authorization: "Bearer old-token" },
                body: stream.Readable.from(["chunk"]),
                requestType: "bytes",
                duplex: "half",
                maxRetries: 2,
                responseType: "json",
                authRefresh: { headers: { Authorization: "Bearer old-token" }, refresh },
            });

            expect(result.ok).toBe(false);
            if (!result.ok) {
                expect(result.error).toMatchObject({ reason: "status-code", statusCode: 401 });
            }
            expect(refresh).not.toHaveBeenCalled();
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });

        it("should retry a 401 when the request body is a buffer", async () => {
            mockFetchResponses(new Response("", { status: 401 }), new Response(JSON.stringify({}), { status: 200 }));
            const refresh = jest.fn().mockResolvedValue({ Authorization: "Bearer new-token" });

            const result = await fetcherImpl({
                url: "https://example.com/upload",
                method: "POST",
                headers: { Authorization: "Bearer old-token" },
                body: new Uint8Array([1, 2, 3]),
                requestType: "bytes",
                maxRetries: 2,
                responseType: "json",
                authRefresh: { headers: { Authorization: "Bearer old-token" }, refresh },
            });

            expect(result.ok).toBe(true);
            expect(refresh).toHaveBeenCalledTimes(1);
            expect(sentAuthorization).toEqual(["Bearer old-token", "Bearer new-token"]);
        });

        it("should return 401 as an error when authRefresh is not set", async () => {
            global.fetch = jest.fn().mockResolvedValue(new Response("", { status: 401 }));

            const result = await fetcherImpl({
                url: "https://example.com/resource",
                method: "GET",
                headers: { Authorization: "Bearer old-token" },
                maxRetries: 2,
                responseType: "json",
            });

            expect(result.ok).toBe(false);
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });
});
