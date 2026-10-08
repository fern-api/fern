import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
    AIChatConfig,
    ApiSpecImportSettings,
    DocsConfiguration,
    ProductFileConfig,
    ThemeConfig,
    VersionFileConfig
} from "../DocsYmlSchemas.js";

describe("DocsYmlSchemas", () => {
    it("should produce JSON Schema for DocsConfiguration", () => {
        const jsonSchema = z.toJSONSchema(DocsConfiguration) as Record<string, unknown>;
        expect(jsonSchema).toBeDefined();
        expect(jsonSchema["type"]).toBe("object");
        expect(jsonSchema["properties"]).toBeDefined();
    });

    it("should produce JSON Schema for VersionFileConfig", () => {
        const jsonSchema = z.toJSONSchema(VersionFileConfig) as Record<string, unknown>;
        expect(jsonSchema).toBeDefined();
        expect(jsonSchema["type"]).toBe("object");
        expect(jsonSchema["properties"]).toBeDefined();
    });

    it("should produce JSON Schema for ProductFileConfig", () => {
        const jsonSchema = z.toJSONSchema(ProductFileConfig) as Record<string, unknown>;
        expect(jsonSchema).toBeDefined();
        expect(jsonSchema["type"]).toBe("object");
        expect(jsonSchema["properties"]).toBeDefined();
    });

    it("DocsConfiguration JSON Schema should contain expected top-level properties", () => {
        const jsonSchema = z.toJSONSchema(DocsConfiguration) as Record<string, unknown>;
        const properties = jsonSchema["properties"] as Record<string, unknown>;
        expect(properties).toBeDefined();
        expect(properties["instances"]).toBeDefined();
        expect(properties["title"]).toBeDefined();
        expect(properties["navigation"]).toBeDefined();
        expect(properties["navbar-links"]).toBeDefined();
        expect(properties["colors"]).toBeDefined();
        expect(properties["typography"]).toBeDefined();
        expect(properties["layout"]).toBeDefined();
        expect(properties["ai-search"]).toBeDefined();
        expect(properties["agents"]).toBeDefined();
        expect(properties["check"]).toBeDefined();
    });

    it("layout.api-reference-expand-properties is an optional boolean", () => {
        const parse = (layout: unknown) => DocsConfiguration.safeParse({ instances: [], layout });
        expect(parse({}).success).toBe(true);
        expect(parse({ "api-reference-expand-properties": true }).success).toBe(true);
        expect(parse({ "api-reference-expand-properties": false }).success).toBe(true);
        expect(parse({ "api-reference-expand-properties": "yes" }).success).toBe(false);
    });

    it("AIChatConfig defaults mask-pii to undefined (masking off by default)", () => {
        const parsed = AIChatConfig.parse({});
        expect(parsed["mask-pii"]).toBeUndefined();
    });

    it("AIChatConfig preserves an explicit mask-pii opt-in", () => {
        expect(AIChatConfig.parse({ "mask-pii": true })["mask-pii"]).toBe(true);
        expect(AIChatConfig.parse({ "mask-pii": false })["mask-pii"]).toBe(false);
    });

    it("ThemeConfig accepts site-switcher presentation options", () => {
        const parsed = ThemeConfig.parse({
            "site-switcher": {
                enabled: true,
                order: ["/dynamo", "/nemo"],
                hide: ["/internal"],
                labels: { "/holoscan/sdk-user-guide": "Holoscan SDK" },
                "show-products": true
            }
        });
        expect(parsed["site-switcher"]).toEqual({
            enabled: true,
            order: ["/dynamo", "/nemo"],
            hide: ["/internal"],
            labels: { "/holoscan/sdk-user-guide": "Holoscan SDK" },
            "show-products": true
        });
        expect(ThemeConfig.parse({})["site-switcher"]).toBeUndefined();
    });

    it("validates ensured API error response status codes", () => {
        const settings = (statusCode: number) => ({
            "error-responses": {
                schema: { type: "object" },
                ensure: [{ "status-code": statusCode }]
            }
        });

        expect(ApiSpecImportSettings.safeParse(settings(400)).success).toBe(true);
        expect(ApiSpecImportSettings.safeParse(settings(599)).success).toBe(true);
        expect(ApiSpecImportSettings.safeParse(settings(399)).success).toBe(false);
        expect(ApiSpecImportSettings.safeParse(settings(600)).success).toBe(false);
    });

    it("should preserve explicitly configured check rule severities", () => {
        const parsed = DocsConfiguration.parse({
            instances: [],
            check: {
                rules: {
                    "example-validation": "error",
                    "valid-docs-endpoints": "warn"
                }
            }
        });

        expect(parsed.check?.rules?.["example-validation"]).toBe("error");
        expect(parsed.check?.rules?.["valid-docs-endpoints"]).toBe("warn");
        expect(parsed.check?.rules?.["broken-links"]).toBeUndefined();
    });
});
