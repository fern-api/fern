import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import {
    HttpResponsePromise,
    RawResponse,
    WithRawResponse,
    toRawResponse,
} from "../../../src/core/fetcher/RawResponse";

describe("RawResponse", () => {
    describe("toRawResponse", () => {
        it("should convert Response to RawResponse by removing body, bodyUsed, and ok properties", () => {
            const mockHeaders = new Headers({ "content-type": "application/json" });
            const mockResponse = {
                body: "test body",
                bodyUsed: false,
                ok: true,
                headers: mockHeaders,
                redirected: false,
                status: 200,
                statusText: "OK",
                type: "basic" as ResponseType,
                url: "https://example.com",
            };

            const result = toRawResponse(mockResponse as unknown as Response);

            expect("body" in result).toBe(false);
            expect("bodyUsed" in result).toBe(false);
            expect("ok" in result).toBe(false);
            expect(result.headers).toBe(mockHeaders);
            expect(result.redirected).toBe(false);
            expect(result.status).toBe(200);
            expect(result.statusText).toBe("OK");
            expect(result.type).toBe("basic");
            expect(result.url).toBe("https://example.com");
        });
    });

    describe("HttpResponsePromise", () => {
        const mockRawResponse: RawResponse = {
            headers: new Headers(),
            redirected: false,
            status: 200,
            statusText: "OK",
            type: "basic" as ResponseType,
            url: "https://example.com",
        };
        const mockData = { id: "123", name: "test" };
        const mockWithRawResponse: WithRawResponse<typeof mockData> = {
            data: mockData,
            rawResponse: mockRawResponse,
        };

        describe("fromFunction", () => {
            it("should create a ResponsePromise from a function", async () => {
                const mockFn = jest
                    .fn<(arg1: string, arg2: string) => Promise<WithRawResponse<typeof mockData>>>()
                    .mockResolvedValue(mockWithRawResponse);

                const responsePromise = HttpResponsePromise.fromFunction(mockFn, "arg1", "arg2");

                const result = await responsePromise;
                expect(result).toEqual(mockData);
                expect(mockFn).toHaveBeenCalledWith("arg1", "arg2");

                const resultWithRawResponse = await responsePromise.withRawResponse();
                expect(resultWithRawResponse).toEqual({
                    data: mockData,
                    rawResponse: mockRawResponse,
                });
            });
        });

        describe("fromPromise", () => {
            it("should create a ResponsePromise from a promise", async () => {
                const promise = Promise.resolve(mockWithRawResponse);

                const responsePromise = HttpResponsePromise.fromPromise(promise);

                const result = await responsePromise;
                expect(result).toEqual(mockData);

                const resultWithRawResponse = await responsePromise.withRawResponse();
                expect(resultWithRawResponse).toEqual({
                    data: mockData,
                    rawResponse: mockRawResponse,
                });
            });
        });

        describe("fromExecutor", () => {
            it("should create a ResponsePromise from an executor function", async () => {
                const responsePromise = HttpResponsePromise.fromExecutor((resolve) => {
                    resolve(mockWithRawResponse);
                });

                const result = await responsePromise;
                expect(result).toEqual(mockData);

                const resultWithRawResponse = await responsePromise.withRawResponse();
                expect(resultWithRawResponse).toEqual({
                    data: mockData,
                    rawResponse: mockRawResponse,
                });
            });
        });

        describe("fromResult", () => {
            it("should create a ResponsePromise from a result", async () => {
                const responsePromise = HttpResponsePromise.fromResult(mockWithRawResponse);

                const result = await responsePromise;
                expect(result).toEqual(mockData);

                const resultWithRawResponse = await responsePromise.withRawResponse();
                expect(resultWithRawResponse).toEqual({
                    data: mockData,
                    rawResponse: mockRawResponse,
                });
            });
        });

        describe("Promise methods", () => {
            let responsePromise: HttpResponsePromise<typeof mockData>;

            beforeEach(() => {
                responsePromise = HttpResponsePromise.fromResult(mockWithRawResponse);
            });

            it("should support then() method", async () => {
                const result = await responsePromise.then((data) => ({
                    ...data,
                    modified: true,
                }));

                expect(result).toEqual({
                    ...mockData,
                    modified: true,
                });
            });

            it("should support catch() method", async () => {
                const errorResponsePromise = HttpResponsePromise.fromExecutor((_, reject) => {
                    reject(new Error("Test error"));
                });

                const catchSpy = jest.fn();
                await errorResponsePromise.catch(catchSpy);

                expect(catchSpy).toHaveBeenCalled();
                const error = catchSpy.mock.calls[0]?.[0];
                expect(error).toBeInstanceOf(Error);
                expect((error as Error).message).toBe("Test error");
            });

            it("should support finally() method", async () => {
                const finallySpy = jest.fn();
                await responsePromise.finally(finallySpy);

                expect(finallySpy).toHaveBeenCalled();
            });
        });

        describe("withRawResponse", () => {
            it("should return both data and raw response", async () => {
                const responsePromise = HttpResponsePromise.fromResult(mockWithRawResponse);

                const result = await responsePromise.withRawResponse();

                expect(result).toEqual({
                    data: mockData,
                    rawResponse: mockRawResponse,
                });
            });
        });
    });
});
