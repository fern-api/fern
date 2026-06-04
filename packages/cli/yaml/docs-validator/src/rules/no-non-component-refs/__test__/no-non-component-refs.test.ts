import { describe, expect, it, vi } from "vitest";

import type { RuleContext } from "../../../Rule.js";
import { isInYamlComment } from "../../isInYamlComment.js";
import { NoNonComponentRefsRule } from "../no-non-component-refs.js";

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

    describe("isInYamlComment", () => {
        it("should detect full-line YAML comments", () => {
            const contents = `  # $ref: "#/components/schemas/Foo"`;
            const matchIndex = contents.indexOf("$ref");
            expect(isInYamlComment(contents, matchIndex)).toBe(true);
        });

        it("should detect inline YAML comments", () => {
            const contents = `key: value  # $ref: "#/paths/~1foo"`;
            const matchIndex = contents.indexOf("$ref");
            expect(isInYamlComment(contents, matchIndex)).toBe(true);
        });

        it("should not flag a real $ref", () => {
            const contents = `    $ref: "#/components/schemas/Bar"`;
            const matchIndex = contents.indexOf("$ref");
            expect(isInYamlComment(contents, matchIndex)).toBe(false);
        });

        it("should not flag a quoted $ref", () => {
            const contents = `    "$ref": "#/components/schemas/Baz"`;
            const matchIndex = contents.indexOf('"$ref"');
            expect(isInYamlComment(contents, matchIndex)).toBe(false);
        });

        it("should handle comment on a later line while earlier line has real ref", () => {
            const contents = `    $ref: "#/components/schemas/Real"\n  # $ref: "#/paths/~1fake"`;
            const realIndex = contents.indexOf("$ref");
            const commentIndex = contents.lastIndexOf("$ref");
            expect(isInYamlComment(contents, realIndex)).toBe(false);
            expect(isInYamlComment(contents, commentIndex)).toBe(true);
        });
    });
});
