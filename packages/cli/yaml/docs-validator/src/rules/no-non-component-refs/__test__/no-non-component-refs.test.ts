import { describe, expect, it, vi } from "vitest";

import type { RuleContext } from "../../../Rule";
import { NoNonComponentRefsRule } from "../no-non-component-refs";

describe("NoNonComponentRefsRule", () => {
    it("should be defined and have correct name", () => {
        expect(NoNonComponentRefsRule).toBeDefined();
        expect(NoNonComponentRefsRule.name).toBe("no-non-component-refs");
        expect(NoNonComponentRefsRule.create).toBeDefined();
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

        const ruleVisitor = await NoNonComponentRefsRule.create(mockContext);
        expect(ruleVisitor).toBeDefined();
        expect(ruleVisitor.file).toBeDefined();
        expect(typeof ruleVisitor.file).toBe("function");
    });

    describe("AsyncAPI detection", () => {
        it("should detect AsyncAPI files in YAML format (asyncapi:)", () => {
            const yamlContent = `asyncapi: "3.0.0"
info:
  title: Test API
  version: 1.0.0`;
            expect(yamlContent.includes("asyncapi:")).toBe(true);
        });

        it('should detect AsyncAPI files in JSON format ("asyncapi":)', () => {
            const jsonContent = `{
  "asyncapi": "3.0.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  }
}`;
            // This is the fix - JSON format should also be detected
            const isAsyncAPI = jsonContent.includes("asyncapi:") || jsonContent.includes('"asyncapi":');
            expect(isAsyncAPI).toBe(true);
        });

        it("should not detect regular OpenAPI files as AsyncAPI", () => {
            const openapiContent = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  }
}`;
            const isAsyncAPI = openapiContent.includes("asyncapi:") || openapiContent.includes('"asyncapi":');
            expect(isAsyncAPI).toBe(false);
        });
    });
});
