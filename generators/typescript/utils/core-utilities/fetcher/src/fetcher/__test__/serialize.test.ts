import { RUNTIME } from "../../runtime";
import { createRequestUrl, getRequestBody, getResponseBody, maybeStringifyBody } from "../serialize";

if (RUNTIME.type === "browser") {
    require("jest-fetch-mock").enableMocks();
}

describe("Test getResponseBody", () => {
    it("should handle blob response type", async () => {
        const mockBlob = new Blob(["test"], { type: "text/plain" });
        const mockResponse = new Response(mockBlob);
        const result = await getResponseBody(mockResponse, "blob");
        expect(result).toBeInstanceOf(Blob);
        expect(await (result as Blob).text()).toBe("test");
    });

    it("should handle streaming response type", async () => {
        if (RUNTIME.type === "node") {
            const mockStream = new ReadableStream();
            const mockResponse = new Response(mockStream);
            const result = await getResponseBody(mockResponse, "streaming");
            expect(result).toBe(mockStream);
        }
    });

    it("should handle text response type", async () => {
        const mockResponse = new Response("test text");
        const result = await getResponseBody(mockResponse, "text");
        expect(result).toBe("test text");
    });

    it("should handle JSON response", async () => {
        const mockJson = { key: "value" };
        const mockResponse = new Response(JSON.stringify(mockJson));
        const result = await getResponseBody(mockResponse);
        expect(result).toEqual(mockJson);
    });

    it("should handle empty response", async () => {
        const mockResponse = new Response("");
        const result = await getResponseBody(mockResponse);
        expect(result).toBeUndefined();
    });

    it("should handle non-JSON response", async () => {
        const mockResponse = new Response("invalid json");
        const result = await getResponseBody(mockResponse);
        expect(result).toEqual({
            ok: false,
            error: {
                reason: "non-json",
                statusCode: 200,
                rawBody: "invalid json"
            }
        });
    });
});

describe("Test getRequestBody", () => {
    it("should return FormData as is in Node environment", async () => {
        if (RUNTIME.type === "node") {
            const formData = new (await import("formdata-node")).FormData();
            formData.append("key", "value");
            const result = await getRequestBody(formData, "multipart/form-data");
            expect(result).toBe(formData);
        }
    });

    it("should stringify body if not FormData in Node environment", async () => {
        if (RUNTIME.type === "node") {
            const body = { key: "value" };
            const result = await getRequestBody(body, "application/json");
            expect(result).toBe('{"key":"value"}');
        }
    });

    // it("should return FormData as is in browser environment", async () => {
    //     setBrowser();
    //     const formData = new (await import("form-data")).default();
    //     formData.append("key", "value");
    //     const result = await getRequestBody(formData, "multipart/form-data");
    //     expect(result).toBe(formData);
    // });

    it("should stringify body if not FormData in browser environment", async () => {
        if (RUNTIME.type === "browser") {
            const body = { key: "value" };
            const result = await getRequestBody(body, "application/json");
            expect(result).toBe('{"key":"value"}');
        }
    });
});

describe("Test maybeStringifyBody", () => {
    it("should return the Uint8Array", () => {
        const input = new Uint8Array([1, 2, 3]);
        const result = maybeStringifyBody(input, "application/octet-stream");
        expect(result).toBe(input);
    });

    it("should return the input for content-type 'application/x-www-form-urlencoded'", () => {
        const input = "key=value&another=param";
        const result = maybeStringifyBody(input, "application/x-www-form-urlencoded");
        expect(result).toBe(input);
    });

    it("should JSON stringify objects", () => {
        const input = { key: "value" };
        const result = maybeStringifyBody(input, "application/json");
        expect(result).toBe('{"key":"value"}');
    });
});

describe("Test createRequestUrl", () => {
    it("should return the base URL when no query parameters are provided", () => {
        const baseUrl = "https://api.example.com";
        expect(createRequestUrl(baseUrl)).toBe(baseUrl);
    });

    it("should append simple query parameters", () => {
        const baseUrl = "https://api.example.com";
        const queryParams = { key: "value", another: "param" };
        expect(createRequestUrl(baseUrl, queryParams)).toBe("https://api.example.com?key=value&another=param");
    });

    it("should handle array query parameters", () => {
        const baseUrl = "https://api.example.com";
        const queryParams = { items: ["a", "b", "c"] };
        expect(createRequestUrl(baseUrl, queryParams)).toBe("https://api.example.com?items=a&items=b&items=c");
    });

    it("should handle object query parameters", () => {
        const baseUrl = "https://api.example.com";
        const queryParams = { filter: { name: "John", age: 30 } };
        expect(createRequestUrl(baseUrl, queryParams)).toBe(
            "https://api.example.com?filter%5Bname%5D=John&filter%5Bage%5D=30"
        );
    });

    it("should handle mixed types of query parameters", () => {
        const baseUrl = "https://api.example.com";
        const queryParams = {
            simple: "value",
            array: ["x", "y"],
            object: { key: "value" }
        };
        expect(createRequestUrl(baseUrl, queryParams)).toBe(
            "https://api.example.com?simple=value&array=x&array=y&object%5Bkey%5D=value"
        );
    });

    it("should handle empty query parameters object", () => {
        const baseUrl = "https://api.example.com";
        expect(createRequestUrl(baseUrl, {})).toBe(baseUrl);
    });

    it("should encode special characters in query parameters", () => {
        const baseUrl = "https://api.example.com";
        const queryParams = { special: "a&b=c d" };
        expect(createRequestUrl(baseUrl, queryParams)).toBe("https://api.example.com?special=a%26b%3Dc%20d");
    });
});
