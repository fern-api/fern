import { RUNTIME } from "../../runtime";
import { getRequestBody, maybeStringifyBody } from "../getRequestBody";

if (RUNTIME.type === "browser") {
    require("jest-fetch-mock").enableMocks();
}

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

    it("should return FormData in browser environment", async () => {
        if (RUNTIME.type === "browser") {
            const formData = new (await import("form-data")).default();
            formData.append("key", "value");
            const result = await getRequestBody(formData, "multipart/form-data");
            expect(result).toBe(formData);
        }
    });

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
