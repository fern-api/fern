import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AIChatConfig, DocsConfiguration, ProductFileConfig, VersionFileConfig } from "../DocsYmlSchemas.js";

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

    it("AIChatConfig defaults mask-pii to undefined (masking off by default)", () => {
        const parsed = AIChatConfig.parse({});
        expect(parsed["mask-pii"]).toBeUndefined();
    });

    it("AIChatConfig preserves an explicit mask-pii opt-in", () => {
        expect(AIChatConfig.parse({ "mask-pii": true })["mask-pii"]).toBe(true);
        expect(AIChatConfig.parse({ "mask-pii": false })["mask-pii"]).toBe(false);
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

    it("should allow turning a check rule off", () => {
        const parsed = DocsConfiguration.parse({
            instances: [],
            check: {
                rules: {
                    "missing-redirects": "off"
                }
            }
        });

        expect(parsed.check?.rules?.["missing-redirects"]).toBe("off");
    });
});
