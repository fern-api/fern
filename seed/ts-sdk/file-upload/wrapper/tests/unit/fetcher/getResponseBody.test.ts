import { getResponseBody } from "../../../src/core/fetcher/getResponseBody";

import { chooseStreamWrapper } from "../../../src/core/fetcher/stream-wrappers/chooseStreamWrapper";

import { RUNTIME } from "../../../src/core/runtime";

describe("Test getResponseBody", () => {
    interface SimpleTestCase {
        description: string;
        responseData: string | Record<string, any>;
        responseType?: "blob" | "sse" | "streaming" | "text";
        expected: any;
        skipCondition?: () => boolean;
    }

    const simpleTestCases: SimpleTestCase[] = [
        {
            description: "should handle text response type",
            responseData: "test text",
            responseType: "text",
            expected: "test text",
        },
        {
            description: "should handle JSON response",
            responseData: { key: "value" },
            expected: { key: "value" },
        },
        {
            description: "should handle empty response",
            responseData: "",
            expected: undefined,
        },
        {
            description: "should handle non-JSON response",
            responseData: "invalid json",
            expected: {
                ok: false,
                error: {
                    reason: "non-json",
                    statusCode: 200,
                    rawBody: "invalid json",
                },
            },
        },
    ];

    simpleTestCases.forEach(({ description, responseData, responseType, expected, skipCondition }) => {
        it(description, async () => {
            if (skipCondition?.()) {
                return;
            }

            const mockResponse = new Response(
                typeof responseData === "string" ? responseData : JSON.stringify(responseData),
            );
            const result = await getResponseBody(mockResponse, responseType);
            expect(result).toEqual(expected);
        });
    });

    it("should handle blob response type", async () => {
        const mockBlob = new Blob(["test"], { type: "text/plain" });
        const mockResponse = new Response(mockBlob);
        const result = await getResponseBody(mockResponse, "blob");
        // @ts-expect-error
        expect(result.constructor.name).toBe("Blob");
    });

    it("should handle sse response type", async () => {
        if (RUNTIME.type === "node") {
            const mockStream = new ReadableStream();
            const mockResponse = new Response(mockStream);
            const result = await getResponseBody(mockResponse, "sse");
            expect(result).toBe(mockStream);
        }
    });

    it("should handle streaming response type", async () => {
        if (RUNTIME.type === "node") {
            const mockStream = new ReadableStream();
            const mockResponse = new Response(mockStream);
            const result = await getResponseBody(mockResponse, "streaming");
            // need to reinstantiate string as a result of locked state in Readable Stream after registration with Response
            expect(JSON.stringify(result)).toBe(JSON.stringify(await chooseStreamWrapper(new ReadableStream())));
        }
    });
});
