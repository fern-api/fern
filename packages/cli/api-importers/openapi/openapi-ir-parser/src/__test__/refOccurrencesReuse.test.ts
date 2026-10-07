import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { AbstractOpenAPIV3ParserContext } from "../openapi/v3/AbstractOpenAPIV3ParserContext.js";
import { DummyOpenAPIV3ParserContext } from "../openapi/v3/DummyOpenAPIV3ParserContext.js";
import { OpenAPIV3ParserContext } from "../openapi/v3/OpenAPIV3ParserContext.js";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";

const taskContext = {
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), trace: vi.fn() }
} as unknown as TaskContext;
const source: Source = Source.openapi({ file: "test.yaml" });

const document: OpenAPIV3.Document = {
    openapi: "3.0.0",
    info: { title: "Test API", version: "1.0.0" },
    paths: {
        "/pets": {
            get: {
                responses: {
                    "200": {
                        description: "ok",
                        content: { "application/json": { schema: { $ref: "#/components/schemas/Pet" } } }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            Pet: { type: "object", properties: { owner: { $ref: "#/components/schemas/Owner" } } },
            Owner: { type: "object", properties: { pet: { $ref: "#/components/schemas/Pet" } } }
        }
    }
};

describe("OpenAPI V3 parser context reference occurrences", () => {
    it("shares the parent's reference occurrences with its dummy context", () => {
        const context = new OpenAPIV3ParserContext({
            document,
            taskContext,
            authHeaders: new Set(),
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });

        expect(context.refOccurrences).toEqual({ "#/components/schemas/Pet": 2, "#/components/schemas/Owner": 1 });
        expect((context.DUMMY as AbstractOpenAPIV3ParserContext).refOccurrences).toBe(context.refOccurrences);
    });

    it("computes the same occurrences when none are passed in", () => {
        const fresh = new DummyOpenAPIV3ParserContext({
            document,
            taskContext,
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined
        });
        const shared = new DummyOpenAPIV3ParserContext({
            document,
            taskContext,
            options: DEFAULT_PARSE_OPENAPI_SETTINGS,
            source,
            namespace: undefined,
            refOccurrences: fresh.refOccurrences
        });

        expect(shared.refOccurrences).toBe(fresh.refOccurrences);
        expect(fresh.refOccurrences).toEqual({ "#/components/schemas/Pet": 2, "#/components/schemas/Owner": 1 });
    });
});
