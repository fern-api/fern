import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { parse } from "../parse.js";

function mockTaskContext(warn: ReturnType<typeof vi.fn>): TaskContext {
    return {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn,
            error: vi.fn(),
            trace: vi.fn(),
            log: vi.fn()
        }
    } as unknown as TaskContext;
}

function buildDoc(mapping: Record<string, string>): OpenAPIV3.Document {
    return {
        openapi: "3.0.0",
        info: { title: "Test API", version: "1.0" },
        paths: {
            "/nodes": {
                post: {
                    operationId: "createNode",
                    requestBody: {
                        required: true,
                        content: {
                            "application/json": {
                                schema: { $ref: "#/components/schemas/Node" }
                            }
                        }
                    },
                    responses: {
                        "200": { description: "OK" }
                    }
                }
            }
        },
        components: {
            schemas: {
                Node: {
                    type: "object",
                    properties: { type: { type: "string" } },
                    required: ["type"],
                    discriminator: {
                        propertyName: "type",
                        mapping
                    },
                    oneOf: [{ $ref: "#/components/schemas/TextNode" }, { $ref: "#/components/schemas/NullNode" }]
                } as OpenAPIV3.SchemaObject,
                TextNode: {
                    type: "object",
                    properties: {
                        type: { type: "string", enum: ["text"] },
                        content: { type: "string" }
                    },
                    required: ["type", "content"]
                },
                NullNode: {
                    type: "object",
                    properties: {
                        type: { type: "string", enum: ["null_literal"] }
                    },
                    required: ["type"]
                }
            }
        }
    };
}

function parseWith(warn: ReturnType<typeof vi.fn>, doc: OpenAPIV3.Document): void {
    parse({
        context: mockTaskContext(warn),
        documents: [
            {
                type: "openapi",
                value: doc,
                source: Source.openapi({ file: "test.yml" }),
                settings: { ...DEFAULT_PARSE_OPENAPI_SETTINGS }
            }
        ]
    });
}

describe("warn about unmapped oneOf members", () => {
    it("warns when a oneOf member is missing from the discriminator mapping", () => {
        const warn = vi.fn();
        // `NullNode` is listed in oneOf but omitted from the mapping.
        parseWith(warn, buildDoc({ text: "#/components/schemas/TextNode" }));

        const warnings = warn.mock.calls.map((call) => String(call[0]));
        const relevant = warnings.find(
            (message) => message.includes("NullNode") && message.includes("discriminator mapping")
        );
        expect(relevant).toBeDefined();
    });

    it("does not warn for an inline null-type member (OpenAPI 3.1 nullable pattern)", () => {
        const warn = vi.fn();
        const doc = buildDoc({ text: "#/components/schemas/TextNode" });
        // Replace the NullNode $ref with an inline `{ type: "null" }` member.
        (doc.components?.schemas?.Node as OpenAPIV3.SchemaObject).oneOf = [
            { $ref: "#/components/schemas/TextNode" },
            { type: "null" } as unknown as OpenAPIV3.SchemaObject
        ];
        parseWith(warn, doc);

        const warnings = warn.mock.calls.map((call) => String(call[0]));
        const relevant = warnings.find((message) => message.includes("inline oneOf/anyOf member"));
        expect(relevant).toBeUndefined();
    });

    it("does not warn when every oneOf member is present in the mapping", () => {
        const warn = vi.fn();
        parseWith(
            warn,
            buildDoc({
                text: "#/components/schemas/TextNode",
                null_literal: "#/components/schemas/NullNode"
            })
        );

        const warnings = warn.mock.calls.map((call) => String(call[0]));
        const relevant = warnings.find(
            (message) => message.includes("NullNode") && message.includes("discriminator mapping")
        );
        expect(relevant).toBeUndefined();
    });
});
