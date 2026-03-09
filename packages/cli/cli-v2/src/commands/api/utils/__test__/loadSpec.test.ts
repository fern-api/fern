import yaml from "js-yaml";
import { describe, expect, it } from "vitest";
import { isJsonFile, parseSpec, serializeSpec } from "../loadSpec.js";

describe("isJsonFile", () => {
    it("returns true for .json files", () => {
        expect(isJsonFile("openapi.json")).toBe(true);
        expect(isJsonFile("/path/to/spec.json")).toBe(true);
    });

    it("returns false for .yml and .yaml files", () => {
        expect(isJsonFile("openapi.yml")).toBe(false);
        expect(isJsonFile("openapi.yaml")).toBe(false);
        expect(isJsonFile("/path/to/spec.yml")).toBe(false);
    });
});

describe("serializeSpec", () => {
    const spec = { openapi: "3.0.0", info: { title: "Test", version: "1.0" } };

    it("serializes as JSON for .json files", () => {
        const result = serializeSpec(spec, "openapi.json");
        expect(result).toBe(JSON.stringify(spec, null, 2) + "\n");
        expect(() => JSON.parse(result)).not.toThrow();
    });

    it("serializes as YAML for .yml files", () => {
        const result = serializeSpec(spec, "openapi.yml");
        expect(() => JSON.parse(result)).toThrow();
        expect(yaml.load(result)).toEqual(spec);
    });

    it("serializes as YAML for .yaml files", () => {
        const result = serializeSpec(spec, "openapi.yaml");
        expect(() => JSON.parse(result)).toThrow();
        expect(yaml.load(result)).toEqual(spec);
    });

    it("round-trips through JSON serialization", () => {
        const result = serializeSpec(spec, "spec.json");
        const parsed = JSON.parse(result);
        expect(parsed).toEqual(spec);
    });

    it("round-trips through YAML serialization", () => {
        const result = serializeSpec(spec, "spec.yml");
        const parsed = yaml.load(result);
        expect(parsed).toEqual(spec);
    });
});

describe("parseSpec", () => {
    it("parses valid JSON", () => {
        const result = parseSpec('{"openapi":"3.0.0"}', "test.json");
        expect(result).toEqual({ openapi: "3.0.0" });
    });

    it("parses valid YAML", () => {
        const result = parseSpec("openapi: '3.0.0'\n", "test.yml");
        expect(result).toEqual({ openapi: "3.0.0" });
    });

    it("throws on invalid content", () => {
        expect(() => parseSpec("{{invalid", "test.yml")).toThrow("Failed to parse");
    });
});
