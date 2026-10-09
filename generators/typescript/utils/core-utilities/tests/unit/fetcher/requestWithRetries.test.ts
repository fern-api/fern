import { requestWithRetries } from "../../../src/core/fetcher/requestWithRetries";

describe("requestWithRetries", () => {
    let mockFetch: jest.Mock;
    let originalMathRandom: typeof Math.random;
    let setTimeoutSpy: jest.SpyInstance;

    beforeEach(() => {
        mockFetch = jest.fn();
        originalMathRandom = Math.random;

        Math.random = jest.fn(() => 0.5);

        jest.useFakeTimers({ doNotFake: ["nextTick"] });
    });

    afterEach(() => {
        Math.random = originalMathRandom;
        jest.clearAllMocks();
        jest.clearAllTimers();
    });

    it("should retry on retryable status codes (legacy mode)", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        const retryableStatuses = [408, 429, 500, 501, 502, 503, 504, 505];
        let callCount = 0;

        mockFetch.mockImplementation(async () => {
            if (callCount < retryableStatuses.length) {
                return new Response("", { status: retryableStatuses[callCount++] });
            }
            return new Response("", { status: 200 });
        });

        const responsePromise = requestWithRetries(() => mockFetch(), retryableStatuses.length);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(retryableStatuses.length + 1);
        expect(response.status).toBe(200);
    });

    it("should retry on 500 Internal Server Error in legacy mode", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 500 }))
            .mockResolvedValueOnce(new Response("", { status: 200 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 3);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(response.status).toBe(200);
    });

    it("should respect maxRetries limit", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        const maxRetries = 2;
        mockFetch.mockResolvedValue(new Response("", { status: 503 }));

        const responsePromise = requestWithRetries(() => mockFetch(), maxRetries);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(maxRetries + 1);
        expect(response.status).toBe(503);
    });

    it("should retry on status 599 (upper boundary of retryable 5xx in legacy mode)", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 599 }))
            .mockResolvedValueOnce(new Response("", { status: 200 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 3);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(2);
        expect(response.status).toBe(200);
    });

    it("should not retry on non-retryable client error (400)", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        mockFetch.mockResolvedValueOnce(new Response("", { status: 400 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 3);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(400);
    });

    it("should not retry on success status codes", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        const successStatuses = [200, 201, 202];

        for (const status of successStatuses) {
            mockFetch.mockReset();
            setTimeoutSpy.mockClear();
            mockFetch.mockResolvedValueOnce(new Response("", { status }));

            const responsePromise = requestWithRetries(() => mockFetch(), 3);
            await jest.runAllTimersAsync();
            await responsePromise;

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(setTimeoutSpy).not.toHaveBeenCalled();
        }
    });

    interface RetryHeaderTestCase {
        description: string;
        headerName: string;
        headerValue: string | (() => string);
        expectedDelayMin: number;
        expectedDelayMax: number;
    }

    const retryHeaderTests: RetryHeaderTestCase[] = [
        {
            description: "should respect retry-after header with seconds value",
            headerName: "retry-after",
            headerValue: "5",
            expectedDelayMin: 4000,
            expectedDelayMax: 6000,
        },
        {
            description: "should respect retry-after header with HTTP date value",
            headerName: "retry-after",
            headerValue: () => new Date(Date.now() + 3000).toUTCString(),
            expectedDelayMin: 2000,
            expectedDelayMax: 4000,
        },
        {
            description: "should respect x-ratelimit-reset header",
            headerName: "x-ratelimit-reset",
            headerValue: () => Math.floor((Date.now() + 4000) / 1000).toString(),
            expectedDelayMin: 3000,
            expectedDelayMax: 6000,
        },
    ];

    retryHeaderTests.forEach(({ description, headerName, headerValue, expectedDelayMin, expectedDelayMax }) => {
        it(description, async () => {
            setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
                process.nextTick(callback);
                return null as any;
            });

            const value = typeof headerValue === "function" ? headerValue() : headerValue;
            mockFetch
                .mockResolvedValueOnce(
                    new Response("", {
                        status: 429,
                        headers: new Headers({ [headerName]: value }),
                    }),
                )
                .mockResolvedValueOnce(new Response("", { status: 200 }));

            const responsePromise = requestWithRetries(() => mockFetch(), 1);
            await jest.runAllTimersAsync();
            const response = await responsePromise;

            expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), expect.any(Number));
            const actualDelay = setTimeoutSpy.mock.calls[0][1];
            expect(actualDelay).toBeGreaterThan(expectedDelayMin);
            expect(actualDelay).toBeLessThan(expectedDelayMax);
            expect(response.status).toBe(200);
        });
    });

    it("should apply correct exponential backoff with jitter", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        mockFetch.mockResolvedValue(new Response("", { status: 502 }));
        const maxRetries = 3;
        const expectedDelays = [1000, 2000, 4000];

        const responsePromise = requestWithRetries(() => mockFetch(), maxRetries);
        await jest.runAllTimersAsync();
        await responsePromise;

        expect(setTimeoutSpy).toHaveBeenCalledTimes(expectedDelays.length);

        expectedDelays.forEach((delay, index) => {
            expect(setTimeoutSpy).toHaveBeenNthCalledWith(index + 1, expect.any(Function), delay);
        });

        expect(mockFetch).toHaveBeenCalledTimes(maxRetries + 1);
    });

    it("should handle concurrent retries independently", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 502 }))
            .mockResolvedValueOnce(new Response("", { status: 502 }))
            .mockResolvedValueOnce(new Response("", { status: 200 }))
            .mockResolvedValueOnce(new Response("", { status: 200 }));

        const promise1 = requestWithRetries(() => mockFetch(), 1);
        const promise2 = requestWithRetries(() => mockFetch(), 1);

        await jest.runAllTimersAsync();
        const [response1, response2] = await Promise.all([promise1, promise2]);

        expect(response1.status).toBe(200);
        expect(response2.status).toBe(200);
    });

    it("should cap delay at MAX_RETRY_DELAY for large header values", async () => {
        setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
            process.nextTick(callback);
            return null as any;
        });

        mockFetch
            .mockResolvedValueOnce(
                new Response("", {
                    status: 429,
                    headers: new Headers({ "retry-after": "120" }), // 120 seconds = 120000ms > MAX_RETRY_DELAY (60000ms)
                }),
            )
            .mockResolvedValueOnce(new Response("", { status: 200 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 1);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 60000);
        expect(response.status).toBe(200);
    });

    describe("with refreshAuth", () => {
        beforeEach(() => {
            setTimeoutSpy = jest.spyOn(global, "setTimeout").mockImplementation((callback: (args: void) => void) => {
                process.nextTick(callback);
                return null as any;
            });
        });

        it("should not retry 401 or 403 without refreshAuth", async () => {
            for (const status of [401, 403]) {
                mockFetch.mockReset();
                mockFetch.mockResolvedValue(new Response("", { status }));

                const responsePromise = requestWithRetries(() => mockFetch(), 3);
                await jest.runAllTimersAsync();
                const response = await responsePromise;

                expect(mockFetch).toHaveBeenCalledTimes(1);
                expect(response.status).toBe(status);
            }
        });

        it.each([401, 403])("should refresh auth before retrying a %d", async (status) => {
            const refreshAuth = jest.fn().mockResolvedValue(undefined);
            const callOrder: string[] = [];
            refreshAuth.mockImplementation(async () => {
                callOrder.push("refresh");
            });
            mockFetch.mockImplementation(async () => {
                callOrder.push("request");
                return callOrder.length === 1
                    ? new Response("", { status })
                    : new Response("", { status: 200 });
            });

            const responsePromise = requestWithRetries(() => mockFetch(), 2, undefined, refreshAuth);
            await jest.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.status).toBe(200);
            expect(refreshAuth).toHaveBeenCalledTimes(1);
            expect(callOrder).toEqual(["request", "refresh", "request"]);
        });

        it("should use maxRetries and backoff for auth failures", async () => {
            const refreshAuth = jest.fn().mockResolvedValue(undefined);
            mockFetch.mockResolvedValue(new Response("", { status: 401 }));

            const responsePromise = requestWithRetries(() => mockFetch(), 2, undefined, refreshAuth);
            await jest.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.status).toBe(401);
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(refreshAuth).toHaveBeenCalledTimes(2);
            expect(setTimeoutSpy).toHaveBeenNthCalledWith(1, expect.any(Function), 1000);
            expect(setTimeoutSpy).toHaveBeenNthCalledWith(2, expect.any(Function), 2000);
        });

        it("should not refresh auth when maxRetries is 0", async () => {
            const refreshAuth = jest.fn().mockResolvedValue(undefined);
            mockFetch.mockResolvedValue(new Response("", { status: 403 }));

            const responsePromise = requestWithRetries(() => mockFetch(), 0, undefined, refreshAuth);
            await jest.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.status).toBe(403);
            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(refreshAuth).not.toHaveBeenCalled();
        });

        it("should only refresh auth for 401 and 403", async () => {
            const refreshAuth = jest.fn().mockResolvedValue(undefined);
            mockFetch
                .mockResolvedValueOnce(new Response("", { status: 503 }))
                .mockResolvedValueOnce(new Response("", { status: 401 }))
                .mockResolvedValueOnce(new Response("", { status: 200 }));

            const responsePromise = requestWithRetries(() => mockFetch(), 3, undefined, refreshAuth);
            await jest.runAllTimersAsync();
            const response = await responsePromise;

            expect(response.status).toBe(200);
            expect(mockFetch).toHaveBeenCalledTimes(3);
            expect(refreshAuth).toHaveBeenCalledTimes(1);
        });

        it("should not send the request again when refreshAuth fails", async () => {
            const refreshError = new Error("token endpoint failed");
            const refreshAuth = jest.fn().mockRejectedValue(refreshError);
            mockFetch.mockResolvedValue(new Response("", { status: 401 }));

            const responsePromise = requestWithRetries(() => mockFetch(), 2, undefined, refreshAuth);
            const assertion = expect(responsePromise).rejects.toBe(refreshError);
            await jest.runAllTimersAsync();
            await assertion;

            expect(mockFetch).toHaveBeenCalledTimes(1);
            expect(refreshAuth).toHaveBeenCalledTimes(1);
        });
    });

    it("should stop waiting and not retry when aborted during the backoff", async () => {
        jest.restoreAllMocks();
        const controller = new AbortController();
        mockFetch.mockImplementation(async () => new Response("", { status: 429, headers: { "Retry-After": "1" } }));

        const responsePromise = requestWithRetries(() => mockFetch(), 2, controller.signal);
        const assertion = expect(responsePromise).rejects.toBe("cancelled");
        await jest.advanceTimersByTimeAsync(30);
        controller.abort("cancelled");
        await assertion;

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
    });

    it("should not wait when the signal is already aborted", async () => {
        jest.restoreAllMocks();
        const controller = new AbortController();
        controller.abort("cancelled");
        mockFetch.mockImplementation(async () => new Response("", { status: 503 }));

        await expect(requestWithRetries(() => mockFetch(), 2, controller.signal)).rejects.toBe("cancelled");
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
    });

    it("should still retry normally when a signal is passed but never aborted", async () => {
        jest.restoreAllMocks();
        const controller = new AbortController();
        mockFetch
            .mockImplementationOnce(async () => new Response("", { status: 503 }))
            .mockImplementationOnce(async () => new Response("", { status: 200 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 2, controller.signal);
        await jest.runAllTimersAsync();
        const response = await responsePromise;

        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledTimes(2);
    });
});
