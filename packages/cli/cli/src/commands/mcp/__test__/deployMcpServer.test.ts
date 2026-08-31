import { describe, expect, it } from "vitest";

import {
    getModuleContentType,
    getSlugValidationError,
    isDeployableModuleFile,
    normalizeJsonc
} from "../deployMcpServer.js";

describe("normalizeJsonc", () => {
    it("strips line and block comments from wrangler-style jsonc", () => {
        const jsonc = `{
  // the entry module
  "main": "index.mjs", /* inline */
  "compatibility_date": "2026-08-07"
}`;
        expect(JSON.parse(normalizeJsonc(jsonc))).toEqual({
            main: "index.mjs",
            compatibility_date: "2026-08-07"
        });
    });

    it("tolerates trailing commas in objects and arrays", () => {
        const jsonc = `{
  "main": "index.mjs",
  "compatibility_flags": ["nodejs_compat",],
}`;
        expect(JSON.parse(normalizeJsonc(jsonc))).toEqual({
            main: "index.mjs",
            compatibility_flags: ["nodejs_compat"]
        });
    });

    it("leaves slashes, escaped quotes, and commas inside strings alone", () => {
        const jsonc = `{"url": "https://example.com//path", "quote": "a \\" // not a comment", "csv": "a, }"}`;
        expect(JSON.parse(normalizeJsonc(jsonc))).toEqual({
            url: "https://example.com//path",
            quote: 'a " // not a comment',
            csv: "a, }"
        });
    });

    it("passes plain JSON through unchanged", () => {
        const json = `{"a": 1, "b": [true, null]}`;
        expect(normalizeJsonc(json)).toBe(json);
    });
});

describe("getSlugValidationError", () => {
    it("accepts valid slugs", () => {
        expect(getSlugValidationError("petstore", "The slug")).toBeUndefined();
        expect(getSlugValidationError("pet-store-2", "The slug")).toBeUndefined();
    });

    it("rejects empty and overlong values", () => {
        expect(getSlugValidationError("", "The slug")).toContain("1-30 characters");
        expect(getSlugValidationError("a".repeat(31), "The slug")).toContain("1-30 characters");
    });

    it("rejects uppercase, underscores, and doubled hyphens", () => {
        expect(getSlugValidationError("PetStore", "The slug")).toContain("lowercase");
        expect(getSlugValidationError("pet_store", "The slug")).toContain("lowercase");
        expect(getSlugValidationError("pet--store", "The slug")).toContain("lowercase");
        expect(getSlugValidationError("-petstore", "The slug")).toContain("lowercase");
    });
});

describe("isDeployableModuleFile", () => {
    it("excludes the bundle descriptors, dotfiles, markdown, and the local runner", () => {
        expect(isDeployableModuleFile("metadata.json")).toBe(false);
        expect(isDeployableModuleFile("wrangler.jsonc")).toBe(false);
        expect(isDeployableModuleFile("catalog.json")).toBe(false);
        expect(isDeployableModuleFile("index.mjs")).toBe(false);
        expect(isDeployableModuleFile(".DS_Store")).toBe(false);
        expect(isDeployableModuleFile("README.md")).toBe(false);
    });

    it("includes module files", () => {
        expect(isDeployableModuleFile("engine.mjs")).toBe(true);
        expect(isDeployableModuleFile("catalog.js")).toBe(true);
        expect(isDeployableModuleFile("lib.wasm")).toBe(true);
    });
});

describe("getModuleContentType", () => {
    it("maps javascript modules, wasm, and everything else", () => {
        expect(getModuleContentType("index.mjs")).toBe("application/javascript+module");
        expect(getModuleContentType("index.js")).toBe("application/javascript+module");
        expect(getModuleContentType("lib.wasm")).toBe("application/wasm");
        expect(getModuleContentType("data.bin")).toBe("application/octet-stream");
    });
});
