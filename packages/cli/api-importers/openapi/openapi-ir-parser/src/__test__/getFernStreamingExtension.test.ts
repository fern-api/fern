import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it } from "vitest";

import {
    getDocumentLevelResumable,
    getFernStreamingExtension,
    getOperationLevelResumable
} from "../openapi/v3/extensions/getFernStreamingExtension.js";

type DocumentWithExtensions = OpenAPIV3.Document & { [key: `x-${string}`]: unknown };
type OperationWithExtensions = OpenAPIV3.OperationObject & { [key: `x-${string}`]: unknown };

function makeDocument(streamingExtension?: unknown): DocumentWithExtensions {
    const doc: DocumentWithExtensions = {
        openapi: "3.0.0",
        info: { title: "Test", version: "1.0.0" },
        paths: {}
    };
    if (streamingExtension !== undefined) {
        doc["x-fern-streaming"] = streamingExtension;
    }
    return doc;
}

function makeOperation(streamingExtension?: unknown): OperationWithExtensions {
    const op: OperationWithExtensions = { responses: {} };
    if (streamingExtension !== undefined) {
        op["x-fern-streaming"] = streamingExtension;
    }
    return op;
}

describe("getFernStreamingExtension - resumable inheritance (Option A: silent fallback)", () => {
    it("uses operation-level resumable when set", () => {
        const document = makeDocument();
        const operation = makeOperation({ format: "sse", resumable: true });

        const result = getFernStreamingExtension(document, operation);

        expect(result?.type).toBe("stream");
        expect(result?.resumable).toBe(true);
    });

    it("falls back to document-level resumable when operation does not set it", () => {
        const document = makeDocument({ resumable: true });
        const operation = makeOperation({ format: "sse" });

        const result = getFernStreamingExtension(document, operation);

        expect(result?.resumable).toBe(true);
    });

    it("operation-level resumable: false overrides document-level resumable: true", () => {
        const document = makeDocument({ resumable: true });
        const operation = makeOperation({ format: "sse", resumable: false });

        const result = getFernStreamingExtension(document, operation);

        expect(result?.resumable).toBe(false);
    });

    it("defaults to false when neither operation nor document sets resumable", () => {
        const document = makeDocument();
        const operation = makeOperation({ format: "sse" });

        const result = getFernStreamingExtension(document, operation);

        expect(result?.resumable).toBe(false);
    });

    it("ignores document-level resumable when operation uses boolean shorthand", () => {
        // Boolean shorthand emits format: "json", which has no Last-Event-ID semantics.
        const document = makeDocument({ resumable: true });
        const operation = makeOperation(true);

        const result = getFernStreamingExtension(document, operation);

        expect(result?.resumable).toBe(false);
    });

    it("inherits resumable for stream-condition endpoints", () => {
        const document = makeDocument({ resumable: true });
        const operation = makeOperation({
            format: "sse",
            "stream-condition": "$request.stream",
            response: { type: "object" },
            "response-stream": { type: "object" }
        });

        const result = getFernStreamingExtension(document, operation);

        expect(result?.type).toBe("streamCondition");
        expect(result?.resumable).toBe(true);
    });

    it("returns undefined (no crash) when only resumable is set, with no format or stream-condition", () => {
        const document = makeDocument();
        const operation = makeOperation({ resumable: true });

        expect(() => getFernStreamingExtension(document, operation)).not.toThrow();
        expect(getFernStreamingExtension(document, operation)).toBeUndefined();
    });

    it("returns undefined (no crash) when stream-condition is missing and format is missing", () => {
        const document = makeDocument();
        const operation = makeOperation({ terminator: "[DONE]" });

        expect(() => getFernStreamingExtension(document, operation)).not.toThrow();
        expect(getFernStreamingExtension(document, operation)).toBeUndefined();
    });
});

describe("getDocumentLevelResumable", () => {
    it("returns true when document-level x-fern-streaming.resumable is true", () => {
        const document = makeDocument({ resumable: true });
        expect(getDocumentLevelResumable(document)).toBe(true);
    });

    it("returns false when document-level x-fern-streaming.resumable is false", () => {
        const document = makeDocument({ resumable: false });
        expect(getDocumentLevelResumable(document)).toBe(false);
    });

    it("returns undefined when document has no x-fern-streaming extension", () => {
        const document = makeDocument();
        expect(getDocumentLevelResumable(document)).toBeUndefined();
    });

    it("returns undefined when document-level x-fern-streaming is a boolean", () => {
        const document = makeDocument(true);
        expect(getDocumentLevelResumable(document)).toBeUndefined();
    });

    it("returns undefined when document-level resumable is a non-boolean value", () => {
        const document = makeDocument({ resumable: "yes" });
        expect(getDocumentLevelResumable(document)).toBeUndefined();
    });
});

describe("getOperationLevelResumable", () => {
    it("returns true when operation-level x-fern-streaming.resumable is true", () => {
        const operation = makeOperation({ resumable: true });
        expect(getOperationLevelResumable(operation)).toBe(true);
    });

    it("returns false when operation-level x-fern-streaming.resumable is false", () => {
        const operation = makeOperation({ resumable: false });
        expect(getOperationLevelResumable(operation)).toBe(false);
    });

    it("returns true even when no format is set (content-type auto-detection case)", () => {
        const operation = makeOperation({ resumable: true });
        expect(getOperationLevelResumable(operation)).toBe(true);
    });

    it("returns undefined when operation has no x-fern-streaming extension", () => {
        const operation = makeOperation();
        expect(getOperationLevelResumable(operation)).toBeUndefined();
    });

    it("returns undefined when operation-level x-fern-streaming is a boolean", () => {
        const operation = makeOperation(true);
        expect(getOperationLevelResumable(operation)).toBeUndefined();
    });

    it("returns undefined when operation-level resumable is a non-boolean value", () => {
        const operation = makeOperation({ resumable: "yes" });
        expect(getOperationLevelResumable(operation)).toBeUndefined();
    });
});
