import yaml from "js-yaml";
import { describe, expect, it, vi } from "vitest";

import type { RuleContext } from "../../../Rule";
import { NoNonComponentRefsRule } from "../no-non-component-refs";

/**
 * Helper function to check if a parsed spec is an AsyncAPI file
 * This mirrors the logic in the actual rule implementation
 */
function isAsyncAPISpec(parsedSpec: unknown): boolean {
    if (!parsedSpec || typeof parsedSpec !== "object") {
        return false;
    }
    return "asyncapi" in (parsedSpec as Record<string, unknown>);
}

/**
 * Helper function to check if a parsed spec is an OpenAPI v2 (Swagger) file
 * This mirrors the logic in the actual rule implementation
 */
function isSwaggerSpec(parsedSpec: unknown): boolean {
    if (!parsedSpec || typeof parsedSpec !== "object") {
        return false;
    }
    const specObj = parsedSpec as Record<string, unknown>;
    return "swagger" in specObj && specObj.swagger === "2.0";
}

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

    describe("AsyncAPI detection via parsing", () => {
        it("should detect AsyncAPI files in YAML format", () => {
            const yamlContent = `asyncapi: "3.0.0"
info:
  title: Test API
  version: 1.0.0`;
            const parsed = yaml.load(yamlContent);
            expect(isAsyncAPISpec(parsed)).toBe(true);
        });

        it("should detect AsyncAPI files in JSON format", () => {
            const jsonContent = `{
  "asyncapi": "3.0.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  }
}`;
            const parsed = yaml.load(jsonContent);
            expect(isAsyncAPISpec(parsed)).toBe(true);
        });

        it("should not detect regular OpenAPI files as AsyncAPI", () => {
            const openapiContent = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  }
}`;
            const parsed = yaml.load(openapiContent);
            expect(isAsyncAPISpec(parsed)).toBe(false);
        });

        it("should not be fooled by asyncapi appearing in descriptions", () => {
            const openapiWithAsyncapiInDescription = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Test API",
    "description": "This API is similar to asyncapi but uses OpenAPI",
    "version": "1.0.0"
  }
}`;
            const parsed = yaml.load(openapiWithAsyncapiInDescription);
            expect(isAsyncAPISpec(parsed)).toBe(false);
        });
    });

    describe("OpenAPI v2 (Swagger) detection via parsing", () => {
        it("should detect Swagger 2.0 files", () => {
            const swaggerContent = `{
  "swagger": "2.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  }
}`;
            const parsed = yaml.load(swaggerContent);
            expect(isSwaggerSpec(parsed)).toBe(true);
        });

        it("should not detect OpenAPI 3.0 files as Swagger", () => {
            const openapiContent = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Test API",
    "version": "1.0.0"
  }
}`;
            const parsed = yaml.load(openapiContent);
            expect(isSwaggerSpec(parsed)).toBe(false);
        });
    });
});
