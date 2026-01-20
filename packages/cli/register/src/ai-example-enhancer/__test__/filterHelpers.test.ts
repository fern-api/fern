import { describe, expect, it } from "vitest";

import { filterRequestBody, isEmptyObject } from "../filterHelpers";

describe("isEmptyObject", () => {
    it("returns true for null", () => {
        expect(isEmptyObject(null)).toBe(true);
    });

    it("returns true for undefined", () => {
        expect(isEmptyObject(undefined)).toBe(true);
    });

    it("returns true for empty object", () => {
        expect(isEmptyObject({})).toBe(true);
    });

    it("returns true for empty array", () => {
        expect(isEmptyObject([])).toBe(true);
    });

    it("returns false for non-empty object", () => {
        expect(isEmptyObject({ key: "value" })).toBe(false);
    });

    it("returns false for non-empty array", () => {
        expect(isEmptyObject([1, 2, 3])).toBe(false);
    });

    it("returns false for string", () => {
        expect(isEmptyObject("hello")).toBe(false);
    });

    it("returns false for number", () => {
        expect(isEmptyObject(42)).toBe(false);
    });

    it("returns false for boolean", () => {
        expect(isEmptyObject(true)).toBe(false);
    });
});

describe("filterRequestBody", () => {
    it("returns original body when body is null", () => {
        const result = filterRequestBody(null, { id: "123" }, undefined, undefined);
        expect(result.filteredBody).toBe(null);
        expect(result.extractedPathParams).toEqual({});
    });

    it("returns original body when body is undefined", () => {
        const result = filterRequestBody(undefined, { id: "123" }, undefined, undefined);
        expect(result.filteredBody).toBe(undefined);
    });

    it("returns original body when body is an array", () => {
        const body = [1, 2, 3];
        const result = filterRequestBody(body, { id: "123" }, undefined, undefined);
        expect(result.filteredBody).toBe(body);
    });

    it("returns original body when body is a primitive", () => {
        const result = filterRequestBody("string body", { id: "123" }, undefined, undefined);
        expect(result.filteredBody).toBe("string body");
    });

    it("filters out path parameters from request body", () => {
        const body = {
            voice_id: "abc123",
            sample_id: "sample456",
            text: "Hello world"
        };
        const pathParams = { voice_id: "", sample_id: "" };

        const result = filterRequestBody(body, pathParams, undefined, undefined);

        expect(result.filteredBody).toEqual({ text: "Hello world" });
        expect(result.extractedPathParams).toEqual({
            voice_id: "abc123",
            sample_id: "sample456"
        });
    });

    it("filters out query parameters from request body", () => {
        const body = {
            output_format: "mp3",
            optimize_streaming_latency: 1,
            text: "Hello world"
        };
        const queryParams = { output_format: "", optimize_streaming_latency: 0 };

        const result = filterRequestBody(body, undefined, queryParams, undefined);

        expect(result.filteredBody).toEqual({ text: "Hello world" });
        expect(result.extractedQueryParams).toEqual({
            output_format: "mp3",
            optimize_streaming_latency: 1
        });
    });

    it("filters out headers from request body", () => {
        const body = {
            "xi-api-key": "secret-key",
            text: "Hello world"
        };
        const headers = { "xi-api-key": "" };

        const result = filterRequestBody(body, undefined, undefined, headers);

        expect(result.filteredBody).toEqual({ text: "Hello world" });
        expect(result.extractedHeaders).toEqual({
            "xi-api-key": "secret-key"
        });
    });

    it("handles case-insensitive matching", () => {
        const body = {
            VoiceId: "abc123",
            SAMPLE_ID: "sample456",
            text: "Hello world"
        };
        const pathParams = { voice_id: "", sample_id: "" };

        const result = filterRequestBody(body, pathParams, undefined, undefined);

        expect(result.filteredBody).toEqual({ text: "Hello world" });
        expect(result.extractedPathParams).toEqual({
            voice_id: "abc123",
            sample_id: "sample456"
        });
    });

    it("handles underscore/hyphen normalization", () => {
        const body = {
            "voice-id": "abc123",
            sample_id: "sample456",
            text: "Hello world"
        };
        const pathParams = { voice_id: "", "sample-id": "" };

        const result = filterRequestBody(body, pathParams, undefined, undefined);

        expect(result.filteredBody).toEqual({ text: "Hello world" });
        expect(result.extractedPathParams).toEqual({
            voice_id: "abc123",
            "sample-id": "sample456"
        });
    });

    it("filters path, query, and headers simultaneously", () => {
        const body = {
            voice_id: "abc123",
            output_format: "mp3",
            "xi-api-key": "secret",
            text: "Hello world",
            model_id: "eleven_monolingual_v1"
        };
        const pathParams = { voice_id: "" };
        const queryParams = { output_format: "" };
        const headers = { "xi-api-key": "" };

        const result = filterRequestBody(body, pathParams, queryParams, headers);

        expect(result.filteredBody).toEqual({
            text: "Hello world",
            model_id: "eleven_monolingual_v1"
        });
        expect(result.extractedPathParams).toEqual({ voice_id: "abc123" });
        expect(result.extractedQueryParams).toEqual({ output_format: "mp3" });
        expect(result.extractedHeaders).toEqual({ "xi-api-key": "secret" });
    });

    it("returns empty filtered body when all fields are parameters", () => {
        const body = {
            voice_id: "abc123",
            sample_id: "sample456"
        };
        const pathParams = { voice_id: "", sample_id: "" };

        const result = filterRequestBody(body, pathParams, undefined, undefined);

        expect(result.filteredBody).toEqual({});
    });

    it("preserves nested objects in body fields", () => {
        const body = {
            voice_id: "abc123",
            settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        };
        const pathParams = { voice_id: "" };

        const result = filterRequestBody(body, pathParams, undefined, undefined);

        expect(result.filteredBody).toEqual({
            settings: {
                stability: 0.5,
                similarity_boost: 0.75
            }
        });
    });

    it("handles empty parameters gracefully", () => {
        const body = {
            text: "Hello world",
            model_id: "eleven_monolingual_v1"
        };

        const result = filterRequestBody(body, {}, {}, {});

        expect(result.filteredBody).toEqual(body);
        expect(result.extractedPathParams).toEqual({});
        expect(result.extractedQueryParams).toEqual({});
        expect(result.extractedHeaders).toEqual({});
    });

    it("handles undefined parameters gracefully", () => {
        const body = {
            text: "Hello world"
        };

        const result = filterRequestBody(body, undefined, undefined, undefined);

        expect(result.filteredBody).toEqual(body);
    });

    it("real-world example: ElevenLabs voice sample audio endpoint", () => {
        const body = {
            voice_id: "JBFqnCBsd6RMkjVDRZzb",
            sample_id: "VW7YKqPnjY4h39yTbx2L",
            xi_api_key: "your-api-key-here",
            output_format: "mp3_44100_128"
        };
        const pathParams = { voice_id: "", sample_id: "" };
        const queryParams = { output_format: "" };
        const headers = { "xi-api-key": "" };

        const result = filterRequestBody(body, pathParams, queryParams, headers);

        expect(result.filteredBody).toEqual({});
        expect(result.extractedPathParams).toEqual({
            voice_id: "JBFqnCBsd6RMkjVDRZzb",
            sample_id: "VW7YKqPnjY4h39yTbx2L"
        });
        expect(result.extractedQueryParams).toEqual({
            output_format: "mp3_44100_128"
        });
        expect(result.extractedHeaders).toEqual({
            "xi-api-key": "your-api-key-here"
        });
    });
});
