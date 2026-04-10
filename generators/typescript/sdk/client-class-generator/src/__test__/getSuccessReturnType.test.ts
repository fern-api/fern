import { FernIr } from "@fern-fern/ir-sdk";
import { getTextOfTsNode } from "@fern-typescript/commons";
import { createHttpEndpoint } from "@fern-typescript/test-utils";
import { ts } from "ts-morph";
import { describe, expect, it } from "vitest";
import { getSuccessReturnType } from "../endpoints/default/endpoint-response/getSuccessReturnType.js";

// ──────────────────────────────────────────────────────────────────────────────
// Mock context
// ──────────────────────────────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: test mock for FileContext
function createMockContext(opts?: { streamType?: "wrapper" | "web" }): any {
    return {
        type: {
            getReferenceToType: (typeRef: FernIr.TypeReference) => {
                if (typeRef.type === "primitive") {
                    const typeText =
                        typeRef.primitive.v1 === "STRING"
                            ? "string"
                            : typeRef.primitive.v1 === "INTEGER"
                              ? "number"
                              : "unknown";
                    return {
                        typeNode: ts.factory.createTypeReferenceNode(typeText),
                        responseTypeNode: undefined,
                        isOptional: false
                    };
                }
                if (typeRef.type === "named") {
                    return {
                        typeNode: ts.factory.createTypeReferenceNode("MyType"),
                        responseTypeNode: ts.factory.createTypeReferenceNode("MyType"),
                        isOptional: false
                    };
                }
                return {
                    typeNode: ts.factory.createTypeReferenceNode("unknown"),
                    responseTypeNode: undefined,
                    isOptional: false
                };
            }
        },
        coreUtilities: {
            stream: {
                Stream: {
                    _getReferenceToType: (itemType: ts.TypeNode) =>
                        ts.factory.createTypeReferenceNode("Stream", [itemType])
                }
            },
            fetcher: {
                BinaryResponse: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("core.BinaryResponse")
                }
            }
        },
        externalDependencies: {
            stream: {
                Readable: {
                    _getReferenceToType: () => ts.factory.createTypeReferenceNode("Readable")
                }
            }
        }
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────────────────────────

describe("getSuccessReturnType", () => {
    describe("when response is undefined", () => {
        it("returns void for non-HEAD endpoint", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const result = getSuccessReturnType(endpoint, undefined, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("void");
        });

        it("returns Headers for HEAD endpoint", () => {
            const endpoint = createHttpEndpoint();
            endpoint.method = FernIr.HttpMethod.Head;
            const context = createMockContext();
            const result = getSuccessReturnType(endpoint, undefined, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("Headers");
        });
    });

    describe("when response is json", () => {
        it("returns the response body type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const jsonResponse = FernIr.HttpResponseBody.json(
                FernIr.JsonResponse.response({
                    responseBodyType: FernIr.TypeReference.named({
                        typeId: "type_User" as FernIr.TypeId,
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        },
                        name: {
                            originalName: "User",
                            camelCase: { unsafeName: "user", safeName: "user" },
                            snakeCase: { unsafeName: "user", safeName: "user" },
                            screamingSnakeCase: { unsafeName: "USER", safeName: "USER" },
                            pascalCase: { unsafeName: "User", safeName: "User" }
                        },
                        default: undefined,
                        inline: undefined,
                        displayName: undefined
                    }),
                    docs: undefined,
                    v2Examples: undefined
                })
            );
            const result = getSuccessReturnType(endpoint, jsonResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("MyType");
        });
    });

    describe("when response is text", () => {
        it("returns string type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const textResponse = FernIr.HttpResponseBody.text({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, textResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("string");
        });
    });

    describe("when response is fileDownload", () => {
        it("returns Readable for wrapper stream type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const fileResponse = FernIr.HttpResponseBody.fileDownload({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, fileResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("Readable");
        });

        it("returns ReadableStream<Uint8Array> for web stream type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const fileResponse = FernIr.HttpResponseBody.fileDownload({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, fileResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "web",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("ReadableStream<Uint8Array>");
        });

        it("returns BinaryResponse for binary-response file type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const fileResponse = FernIr.HttpResponseBody.fileDownload({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, fileResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "binary-response"
            });
            expect(getTextOfTsNode(result)).toBe("core.BinaryResponse");
        });

        it("returns type literal with content headers when includeContentHeadersOnResponse is true", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const fileResponse = FernIr.HttpResponseBody.fileDownload({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, fileResponse, context, {
                includeContentHeadersOnResponse: true,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            const text = getTextOfTsNode(result);
            expect(text).toContain("data");
            expect(text).toContain("contentLengthInBytes");
            expect(text).toContain("contentType");
        });
    });

    describe("when response is bytes", () => {
        it("returns stream type for bytes response", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const bytesResponse = FernIr.HttpResponseBody.bytes({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, bytesResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "web",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("ReadableStream<Uint8Array>");
        });

        it("returns stream type for bytes response with wrapper stream type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const bytesResponse = FernIr.HttpResponseBody.bytes({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, bytesResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("Readable");
        });

        it("returns BinaryResponse for bytes response with binary-response file type", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const bytesResponse = FernIr.HttpResponseBody.bytes({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, bytesResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "binary-response"
            });
            expect(getTextOfTsNode(result)).toBe("core.BinaryResponse");
        });

        it("returns type literal with content headers for bytes when includeContentHeadersOnResponse is true", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const bytesResponse = FernIr.HttpResponseBody.bytes({
                docs: undefined,
                v2Examples: undefined
            });
            const result = getSuccessReturnType(endpoint, bytesResponse, context, {
                includeContentHeadersOnResponse: true,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            const text = getTextOfTsNode(result);
            expect(text).toContain("data");
            expect(text).toContain("contentLengthInBytes");
            expect(text).toContain("contentType");
        });
    });

    describe("when response is streaming", () => {
        it("returns Stream<type> for SSE streaming", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const streamingResponse = FernIr.HttpResponseBody.streaming(
                FernIr.StreamingResponse.sse({
                    payload: FernIr.TypeReference.named({
                        typeId: "type_Event" as FernIr.TypeId,
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        },
                        name: {
                            originalName: "Event",
                            camelCase: { unsafeName: "event", safeName: "event" },
                            snakeCase: { unsafeName: "event", safeName: "event" },
                            screamingSnakeCase: { unsafeName: "EVENT", safeName: "EVENT" },
                            pascalCase: { unsafeName: "Event", safeName: "Event" }
                        },
                        default: undefined,
                        inline: undefined,
                        displayName: undefined
                    }),
                    docs: undefined,
                    terminator: undefined,
                    v2Examples: undefined
                })
            );
            const result = getSuccessReturnType(endpoint, streamingResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("Stream<MyType>");
        });

        it("returns Stream<type> for JSON streaming", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const streamingResponse = FernIr.HttpResponseBody.streaming(
                FernIr.StreamingResponse.json({
                    payload: FernIr.TypeReference.primitive({ v1: "STRING", v2: undefined }),
                    docs: undefined,
                    terminator: undefined,
                    v2Examples: undefined
                })
            );
            const result = getSuccessReturnType(endpoint, streamingResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("Stream<string>");
        });

        it("returns Stream<string> for text streaming", () => {
            const endpoint = createHttpEndpoint();
            const context = createMockContext();
            const streamingResponse = FernIr.HttpResponseBody.streaming(
                FernIr.StreamingResponse.text({
                    docs: undefined,
                    v2Examples: undefined
                })
            );
            const result = getSuccessReturnType(endpoint, streamingResponse, context, {
                includeContentHeadersOnResponse: false,
                streamType: "wrapper",
                fileResponseType: "stream"
            });
            expect(getTextOfTsNode(result)).toBe("Stream<string>");
        });
    });
});
