import "jest-fetch-mock";
import { makeRequest, requestWithRetries } from "../requests";

describe("Test makeRequest", () => {
    const mockPostUrl = "https://httpbin.org/post";
    const mockGetUrl = "https://httpbin.org/get";
    const mockHeaders = { "Content-Type": "application/json" };
    const mockBody = JSON.stringify({ key: "value" });

    let mockFetch: jest.Mock;

    beforeEach(() => {
        mockFetch = jest.fn();
        mockFetch.mockResolvedValue(new Response(JSON.stringify({ test: "successful" }), { status: 200 }));
    });

    it("should handle POST request correctly", async () => {
        const response = await makeRequest(mockFetch, mockPostUrl, "POST", mockHeaders, mockBody);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ test: "successful" });
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
        expect(calledUrl).toBe(mockPostUrl);
        expect(calledOptions).toEqual(
            expect.objectContaining({
                method: "POST",
                headers: mockHeaders,
                body: mockBody,
                credentials: undefined
            })
        );
        expect(calledOptions.signal).toBeDefined();
        expect(calledOptions.signal).toBeInstanceOf(AbortSignal);
    });

    it("should handle GET request correctly", async () => {
        const response = await makeRequest(mockFetch, mockGetUrl, "GET", mockHeaders, undefined);
        const responseBody = await response.json();
        expect(responseBody).toEqual({ test: "successful" });
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [calledUrl, calledOptions] = mockFetch.mock.calls[0];
        expect(calledUrl).toBe(mockGetUrl);
        expect(calledOptions).toEqual(
            expect.objectContaining({
                method: "GET",
                headers: mockHeaders,
                body: undefined,
                credentials: undefined
            })
        );
        expect(calledOptions.signal).toBeDefined();
        expect(calledOptions.signal).toBeInstanceOf(AbortSignal);
    });
});

describe("Test exponential backoff", () => {
    let mockFetch: jest.Mock;
    let originalSetTimeout: typeof setTimeout;

    beforeEach(() => {
        mockFetch = jest.fn();
        originalSetTimeout = global.setTimeout;
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        global.setTimeout = originalSetTimeout;
    });

    it("should retry on 408, 409, 429, 500+", async () => {
        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 408 }))
            .mockResolvedValueOnce(new Response("", { status: 409 }))
            .mockResolvedValueOnce(new Response("", { status: 429 }))
            .mockResolvedValueOnce(new Response("", { status: 500 }))
            .mockResolvedValueOnce(new Response("", { status: 502 }))
            .mockResolvedValueOnce(new Response("", { status: 200 }))
            .mockResolvedValueOnce(new Response("", { status: 408 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 10);

        await jest.advanceTimersByTimeAsync(10000);
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(6);
        expect(response.status).toBe(200);
    });

    it("should retry max 3 times", async () => {
        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 408 }))
            .mockResolvedValueOnce(new Response("", { status: 409 }))
            .mockResolvedValueOnce(new Response("", { status: 429 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 3);

        await jest.advanceTimersByTimeAsync(10000);
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(response.status).toBe(429);
    });
    it("should not retry on 200", async () => {
        mockFetch
            .mockResolvedValueOnce(new Response("", { status: 200 }))
            .mockResolvedValueOnce(new Response("", { status: 409 }));

        const responsePromise = requestWithRetries(() => mockFetch(), 3);

        await jest.advanceTimersByTimeAsync(10000);
        const response = await responsePromise;

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(200);
    });

    it("should retry with exponential backoff timing", async () => {
        mockFetch.mockResolvedValue(new Response("", { status: 500 }));
        const maxRetries = 7;
        const responsePromise = requestWithRetries(() => mockFetch(), maxRetries);
        expect(mockFetch).toHaveBeenCalledTimes(1);
        const delays = [1, 2, 4, 8, 16, 32, 64];
        for (let i = 0; i < delays.length; i++) {
            await jest.advanceTimersByTimeAsync(delays[i] as number);
            expect(mockFetch).toHaveBeenCalledTimes(Math.min(i + 2, maxRetries));
        }
        const response = await responsePromise;
        expect(response.status).toBe(500);
    });
});
