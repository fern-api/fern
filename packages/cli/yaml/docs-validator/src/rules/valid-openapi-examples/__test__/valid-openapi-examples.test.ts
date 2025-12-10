import { describe, expect, it, vi } from "vitest";

import type { RuleContext } from "../../../Rule";
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
                disable: vi.fn(),
                enable: vi.fn(),
                trace: vi.fn(),
                debug: vi.fn(),
                info: vi.fn(),
                warn: vi.fn(),
                error: vi.fn(),
                log: vi.fn()
            },
            workspace: {
                absoluteFilePath: "/test/path"
            }
        } as unknown as RuleContext;

        const ruleVisitor = await ValidOpenApiExamples.create(mockContext);
        expect(ruleVisitor).toBeDefined();
        expect(ruleVisitor.file).toBeDefined();
        expect(typeof ruleVisitor.file).toBe("function");
    });
});
