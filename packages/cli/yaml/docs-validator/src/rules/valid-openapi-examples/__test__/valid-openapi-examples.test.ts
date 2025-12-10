import { describe, expect, it, vi } from "vitest";

import { ValidOpenApiExamples } from "../valid-openapi-examples";

describe("ValidOpenApiExamples", () => {
    it("should be defined and have correct name", () => {
        expect(ValidOpenApiExamples).toBeDefined();
        expect(ValidOpenApiExamples.name).toBe("valid-openapi-examples");
        expect(ValidOpenApiExamples.create).toBeDefined();
    });

    it("should create a rule visitor with file method", async () => {
        const mockContext = {
            ossWorkspaces: [],
            logger: {
                debug: vi.fn(),
                warn: vi.fn(),
                info: vi.fn()
            },
            workspace: {
                absoluteFilePath: "/test/path"
            }
        } as any;

        const ruleVisitor = await ValidOpenApiExamples.create(mockContext);
        expect(ruleVisitor).toBeDefined();
        expect(ruleVisitor.file).toBeDefined();
        expect(typeof ruleVisitor.file).toBe("function");
    });
});
