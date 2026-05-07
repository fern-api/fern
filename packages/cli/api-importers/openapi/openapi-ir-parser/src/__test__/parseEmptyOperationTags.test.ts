import { Source } from "@fern-api/openapi-ir";
import { TaskContext } from "@fern-api/task-context";
import { OpenAPIV3 } from "openapi-types";
import { describe, expect, it, vi } from "vitest";
import { DEFAULT_PARSE_OPENAPI_SETTINGS } from "../options.js";
import { parse } from "../parse.js";

describe("parse with empty operation tags", () => {
    const mockTaskContext = {
        logger: {
            debug: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
            error: vi.fn(),
            trace: vi.fn(),
            log: vi.fn()
        }
    } as unknown as TaskContext;

    it("treats empty-string tags as untagged operations", () => {
        const doc: OpenAPIV3.Document = {
            openapi: "3.0.0",
            info: { title: "Test API", version: "1.0.0" },
            paths: {
                "/bad": {
                    get: {
                        operationId: ".GetBad",
                        tags: [""],
                        responses: {
                            "200": {
                                description: "OK"
                            }
                        }
                    }
                }
            }
        };

        const ir = parse({
            context: mockTaskContext,
            documents: [
                {
                    type: "openapi",
                    value: doc,
                    source: Source.openapi({ file: "test.yml" }),
                    settings: DEFAULT_PARSE_OPENAPI_SETTINGS
                }
            ]
        });

        expect(ir.endpoints).toHaveLength(1);
        expect(ir.endpoints[0]?.tags).toEqual([]);
    });
});
