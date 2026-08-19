import { describe, expect, it } from "vitest";
import { convertOpenApiSpecSettings, convertSettings } from "../converters/convertSettings.js";

describe("convertSettings", () => {
    it("returns empty settings for undefined input", () => {
        const result = convertSettings(undefined);
        expect(result.settings).toEqual({});
        expect(result.warnings).toEqual([]);
    });

    it("converts kebab-case keys to camelCase", () => {
        const result = convertSettings({
            "use-title": true,
            "respect-nullable-schemas": true,
            "optional-additional-properties": false
        } as never);
        expect(result.settings).toMatchObject({
            titleAsSchemaName: true,
            respectNullableSchemas: true,
            optionalAdditionalProperties: false
        });
    });

    it("converts path-parameter-order values", () => {
        const urlResult = convertSettings({ "path-parameter-order": "url-order" } as never);
        expect(urlResult.settings.pathParameterOrder).toBe("urlOrder");

        const specResult = convertSettings({ "path-parameter-order": "spec-order" } as never);
        expect(specResult.settings.pathParameterOrder).toBe("specOrder");
    });

    it("converts default-form-parameter-encoding values", () => {
        const formResult = convertSettings({ "default-form-parameter-encoding": "form" } as never);
        expect(formResult.settings.defaultFormParameterEncoding).toBe("form");

        const jsonResult = convertSettings({ "default-form-parameter-encoding": "json" } as never);
        expect(jsonResult.settings.defaultFormParameterEncoding).toBe("json");
    });

    it("converts unions: v1 to preferUndiscriminatedUnionsWithLiterals: true", () => {
        const result = convertSettings({ unions: "v1" } as never);
        expect(result.settings.preferUndiscriminatedUnionsWithLiterals).toBe(true);
        // 'unions' itself should not be in the output
        expect(result.settings).not.toHaveProperty("unions");
    });

    it("drops unions key for non-v1 values", () => {
        const result = convertSettings({ unions: "v2" } as never);
        expect(result.settings).not.toHaveProperty("unions");
        expect(result.settings).not.toHaveProperty("preferUndiscriminatedUnionsWithLiterals");
    });

    it("passes through unknown keys unchanged", () => {
        const result = convertSettings({ "unknown-key": "value" } as never);
        expect(result.settings).toHaveProperty("unknown-key", "value");
    });

    it("skips undefined values", () => {
        const result = convertSettings({ "use-title": undefined } as never);
        expect(result.settings).not.toHaveProperty("titleAsSchemaName");
    });

    it("converts message-naming for AsyncAPI", () => {
        const result = convertSettings({ "message-naming": "operation-id" } as never);
        expect(result.settings).toHaveProperty("messageNaming", "operation-id");
    });

    it("converts a full real-world settings block", () => {
        const result = convertSettings({
            "use-title": true,
            "respect-nullable-schemas": false,
            "optional-additional-properties": true,
            "path-parameter-order": "url-order",
            "idiomatic-request-names": true,
            unions: "v1"
        } as never);
        expect(result.settings).toMatchObject({
            titleAsSchemaName: true,
            respectNullableSchemas: false,
            optionalAdditionalProperties: true,
            pathParameterOrder: "urlOrder",
            idiomaticRequestNames: true,
            preferUndiscriminatedUnionsWithLiterals: true
        });
    });
});

describe("convertOpenApiSpecSettings", () => {
    it("returns empty settings for undefined input", () => {
        const result = convertOpenApiSpecSettings(undefined);
        expect(result.settings).toEqual({});
        expect(result.warnings).toEqual([]);
    });

    it("converts standard kebab-case keys to camelCase", () => {
        const result = convertOpenApiSpecSettings({
            "only-include-referenced-schemas": true,
            "inline-path-parameters": false,
            "respect-readonly-schemas": true
        });
        expect(result.settings).toMatchObject({
            onlyIncludeReferencedSchemas: true,
            inlinePathParameters: false,
            respectReadonlySchemas: true
        });
    });

    it("converts nested example-generation settings", () => {
        const result = convertOpenApiSpecSettings({
            "example-generation": {
                request: { "max-depth": 3 },
                response: { "max-depth": 5 }
            }
        });
        expect(result.settings.exampleGeneration).toEqual({
            request: { maxDepth: 3 },
            response: { maxDepth: 5 }
        });
    });

    it("converts example-generation with camelCase max-depth (already camelCase)", () => {
        const result = convertOpenApiSpecSettings({
            "example-generation": {
                request: { maxDepth: 2 }
            }
        });
        expect((result.settings.exampleGeneration as { request: { maxDepth: number } }).request.maxDepth).toBe(2);
    });

    it("converts path-parameter-order", () => {
        const result = convertOpenApiSpecSettings({ "path-parameter-order": "spec-order" });
        expect(result.settings.pathParameterOrder).toBe("specOrder");
    });

    it("converts default-form-parameter-encoding", () => {
        const result = convertOpenApiSpecSettings({ "default-form-parameter-encoding": "form" });
        expect(result.settings.defaultFormParameterEncoding).toBe("form");
    });

    it("passes through resolve-aliases as an object", () => {
        const result = convertOpenApiSpecSettings({ "resolve-aliases": { enabled: true } });
        expect(result.settings.resolveAliases).toEqual({ enabled: true });
    });

    it("handles a realistic xai openapi spec settings block", () => {
        const result = convertOpenApiSpecSettings({
            "only-include-referenced-schemas": true,
            "prefer-undiscriminated-unions-with-literals": true,
            "object-query-parameters": false
        });
        expect(result.settings).toMatchObject({
            onlyIncludeReferencedSchemas: true,
            preferUndiscriminatedUnionsWithLiterals: true,
            objectQueryParameters: false
        });
    });
});
