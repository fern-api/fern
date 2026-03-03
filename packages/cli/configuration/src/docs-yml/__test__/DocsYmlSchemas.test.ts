import { describe, expect, it } from "vitest";
import { zodToJsonSchema } from "zod-to-json-schema";

import { DocsConfiguration, ProductFileConfig, VersionFileConfig } from "../DocsYmlSchemas.js";

describe("DocsYmlSchemas", () => {
    it("should produce JSON Schema for DocsConfiguration", () => {
        const jsonSchema = zodToJsonSchema(DocsConfiguration, "DocsConfiguration") as Record<string, unknown>;
        expect(jsonSchema).toBeDefined();
        expect(jsonSchema["$ref"]).toBe("#/definitions/DocsConfiguration");
        expect(jsonSchema["definitions"]).toBeDefined();
        const definitions = (jsonSchema["definitions"] ?? {}) as Record<string, unknown>;
        expect(definitions["DocsConfiguration"]).toBeDefined();
    });

    it("should produce JSON Schema for VersionFileConfig", () => {
        const jsonSchema = zodToJsonSchema(VersionFileConfig, "VersionFileConfig") as Record<string, unknown>;
        expect(jsonSchema).toBeDefined();
        expect(jsonSchema["$ref"]).toBe("#/definitions/VersionFileConfig");
        expect(jsonSchema["definitions"]).toBeDefined();
        const definitions = (jsonSchema["definitions"] ?? {}) as Record<string, unknown>;
        expect(definitions["VersionFileConfig"]).toBeDefined();
    });

    it("should produce JSON Schema for ProductFileConfig", () => {
        const jsonSchema = zodToJsonSchema(ProductFileConfig, "ProductFileConfig") as Record<string, unknown>;
        expect(jsonSchema).toBeDefined();
        expect(jsonSchema["$ref"]).toBe("#/definitions/ProductFileConfig");
        expect(jsonSchema["definitions"]).toBeDefined();
        const definitions = (jsonSchema["definitions"] ?? {}) as Record<string, unknown>;
        expect(definitions["ProductFileConfig"]).toBeDefined();
    });

    it("DocsConfiguration JSON Schema should contain expected top-level properties", () => {
        const jsonSchema = zodToJsonSchema(DocsConfiguration, "DocsConfiguration") as Record<string, unknown>;
        const definitions = (jsonSchema["definitions"] ?? {}) as Record<string, unknown>;
        const docsConfigDef = definitions["DocsConfiguration"] as Record<string, unknown>;
        const properties = docsConfigDef["properties"] as Record<string, unknown>;
        expect(properties).toBeDefined();
        expect(properties["instances"]).toBeDefined();
        expect(properties["title"]).toBeDefined();
        expect(properties["navigation"]).toBeDefined();
        expect(properties["navbar-links"]).toBeDefined();
        expect(properties["colors"]).toBeDefined();
        expect(properties["typography"]).toBeDefined();
        expect(properties["layout"]).toBeDefined();
        expect(properties["ai-search"]).toBeDefined();
    });
});
