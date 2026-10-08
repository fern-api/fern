import fs from "fs";
import { join } from "path";
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

    it("should time out while reading a slow JSON body", async () => {
        global.fetch = jest.fn().mockImplementation(async (_url: string, init: RequestInit) => {
            const body = new ReadableStream<Uint8Array>({
                start(controller) {
                    controller.enqueue(new TextEncoder().encode('{"data":'));
                    init.signal?.addEventListener("abort", () => controller.error(init.signal?.reason));
                },
            });
            return new Response(body, { status: 200, headers: { "Content-Type": "application/json" } });
        });

        const result = await fetcherImpl({
            url: "https://example.com/slow",
            method: "GET",
            maxRetries: 0,
            timeoutMs: 20,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.reason).toBe("timeout");
        }
    });

    it("should report a timeout when fetch rejects with the timeout reason", async () => {
        global.fetch = jest.fn().mockImplementation(
            (_url: string, init: RequestInit) =>
                new Promise((_resolve, reject) => {
                    init.signal?.addEventListener("abort", () => reject(init.signal?.reason));
                }),
        );

        const result = await fetcherImpl({
            url: "https://example.com/slow",
            method: "GET",
            maxRetries: 0,
            timeoutMs: 20,
        });

        expect(result.ok).toBe(false);
        if (!result.ok) {
            expect(result.error.reason).toBe("timeout");
        }
    });

    it("should not leave timers running after a request succeeds or fails", async () => {
        jest.useFakeTimers();
        try {
            global.fetch = jest
                .fn()
                .mockResolvedValueOnce(
                    new Response(JSON.stringify({ data: "test" }), {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    }),
                )
                .mockRejectedValueOnce(new TypeError("fetch failed"));

            const success = await fetcherImpl({
                url: "https://example.com",
                method: "GET",
                maxRetries: 0,
                timeoutMs: 1000,
            });
            expect(success.ok).toBe(true);
            expect(jest.getTimerCount()).toBe(0);

            const failure = await fetcherImpl({
                url: "https://example.com",
                method: "GET",
                maxRetries: 0,
                timeoutMs: 1000,
            });
            expect(failure.ok).toBe(false);
            expect(jest.getTimerCount()).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should clear the previous attempt's timeout before a retry is sent", async () => {
        jest.useFakeTimers();
        try {
            const timersSeenByAttempt: number[] = [];
            let attempt = 0;
            global.fetch = jest.fn().mockImplementation(async () => {
                timersSeenByAttempt.push(jest.getTimerCount());
                attempt += 1;
                return attempt === 1
                    ? new Response("busy", { status: 503, headers: { "Retry-After": "1" } })
                    : new Response(JSON.stringify({ data: "test" }), {
                          status: 200,
                          headers: { "Content-Type": "application/json" },
                      });
            });

            const promise = fetcherImpl({
                url: "https://example.com",
                method: "GET",
                maxRetries: 1,
                timeoutMs: 60_000,
            });
            await jest.advanceTimersByTimeAsync(2_000);
            const result = await promise;

            expect(result.ok).toBe(true);
            // The retry only sees its own timeout timer, not the first attempt's.
            expect(timersSeenByAttempt).toEqual([1, 1]);
            expect(jest.getTimerCount()).toBe(0);
        } finally {
            jest.useRealTimers();
        }
    });
});
