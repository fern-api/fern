import { describe, expect, it } from "vitest";
import { GENERATOR_MINIMUM_VERSIONS, MINIMUM_SUPPORTED_IR_VERSION } from "../generated/generatorVersionMap.js";

describe("Generated Version Map", () => {
    it("should export MINIMUM_SUPPORTED_IR_VERSION constant", () => {
        expect(MINIMUM_SUPPORTED_IR_VERSION).toBe(53);
    });

    it("should contain generator version mappings", () => {
        expect(GENERATOR_MINIMUM_VERSIONS).toBeTypeOf("object");
        expect(Object.keys(GENERATOR_MINIMUM_VERSIONS).length).toBeGreaterThan(0);
    });

    it("should contain expected core generators", () => {
        // Test a few key generators that should always be present
        const expectedGenerators = [
            "fernapi/fern-python-sdk",
            "fernapi/fern-typescript-sdk",
            "fernapi/fern-go-sdk",
            "fernapi/fern-java-sdk",
            "fernapi/fern-csharp-sdk"
        ];

        for (const generator of expectedGenerators) {
            expect(GENERATOR_MINIMUM_VERSIONS).toHaveProperty(generator);
            expect(GENERATOR_MINIMUM_VERSIONS[generator]).toBeTypeOf("string");
            expect(GENERATOR_MINIMUM_VERSIONS[generator]).toMatch(/^\d+\.\d+\.\d+/);
        }
    });

    it("should include legacy TypeScript generator names", () => {
        expect(GENERATOR_MINIMUM_VERSIONS).toHaveProperty("fernapi/fern-typescript-node-sdk");
        expect(GENERATOR_MINIMUM_VERSIONS).toHaveProperty("fernapi/fern-typescript-browser-sdk");

        // Legacy names should match the main TypeScript SDK version
        expect(GENERATOR_MINIMUM_VERSIONS["fernapi/fern-typescript-node-sdk"]).toBe(
            GENERATOR_MINIMUM_VERSIONS["fernapi/fern-typescript-sdk"]
        );
        expect(GENERATOR_MINIMUM_VERSIONS["fernapi/fern-typescript-browser-sdk"]).toBe(
            GENERATOR_MINIMUM_VERSIONS["fernapi/fern-typescript-sdk"]
        );
    });

    it("should not contain undefined or empty versions", () => {
        for (const [name, version] of Object.entries(GENERATOR_MINIMUM_VERSIONS)) {
            expect(version).toBeDefined();
            expect(version).not.toBe("");
            expect(version).toBeTypeOf("string");
        }
    });

    it("should have generator names in expected format", () => {
        for (const name of Object.keys(GENERATOR_MINIMUM_VERSIONS)) {
            expect(name).toMatch(/^fernapi\/fern-.+/);
        }
    });
});
