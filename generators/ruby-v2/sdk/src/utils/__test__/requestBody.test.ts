import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { isUrlEncodedRequestBody, URL_ENCODED_CONTENT_TYPE } from "../requestBody.js";

function inlinedRequestBody(contentType: string | undefined): FernIr.HttpRequestBody {
    return FernIr.HttpRequestBody.inlinedRequestBody({
        name: "request",
        extends: [],
        properties: [],
        extendedProperties: undefined,
        extraProperties: false,
        docs: undefined,
        contentType,
        v2Examples: undefined
    });
}

function referenceRequestBody(contentType: string | undefined): FernIr.HttpRequestBody {
    return FernIr.HttpRequestBody.reference({
        requestBodyType: FernIr.TypeReference.unknown(),
        required: undefined,
        docs: undefined,
        contentType,
        v2Examples: undefined
    });
}

function bytesRequestBody(contentType: string | undefined): FernIr.HttpRequestBody {
    return FernIr.HttpRequestBody.bytes({
        isOptional: false,
        docs: undefined,
        contentType,
        v2Examples: undefined
    });
}

describe("isUrlEncodedRequestBody", () => {
    it("returns true for an inlined request body with the form-urlencoded content type", () => {
        expect(isUrlEncodedRequestBody(inlinedRequestBody(URL_ENCODED_CONTENT_TYPE))).toBe(true);
    });

    it("returns true for a reference request body with the form-urlencoded content type", () => {
        expect(isUrlEncodedRequestBody(referenceRequestBody(URL_ENCODED_CONTENT_TYPE))).toBe(true);
    });

    it("returns false for an inlined request body with a JSON content type", () => {
        expect(isUrlEncodedRequestBody(inlinedRequestBody("application/json"))).toBe(false);
    });

    it("returns false for an inlined request body with no content type", () => {
        expect(isUrlEncodedRequestBody(inlinedRequestBody(undefined))).toBe(false);
    });

    it("returns false for a reference request body with no content type", () => {
        expect(isUrlEncodedRequestBody(referenceRequestBody(undefined))).toBe(false);
    });

    it("returns false for a bytes request body even when its content type is form-urlencoded", () => {
        // bytes bodies are streamed verbatim, never form-encoded.
        expect(isUrlEncodedRequestBody(bytesRequestBody(URL_ENCODED_CONTENT_TYPE))).toBe(false);
    });

    it("returns false when there is no request body", () => {
        expect(isUrlEncodedRequestBody(undefined)).toBe(false);
    });
});
