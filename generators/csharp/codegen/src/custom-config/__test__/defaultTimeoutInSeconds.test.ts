import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";
import { MinimalGeneratorConfig } from "../../context/common.js";
import { Generation } from "../../context/generation-info.js";
import { CsharpConfigSchema } from "../CsharpConfigSchema.js";

type IntermediateRepresentation = FernIr.IntermediateRepresentation;

function resolveTimeoutInMilliseconds(customConfig: CsharpConfigSchema): number | "infinity" | undefined {
    const generation = new Generation(
        {} as unknown as IntermediateRepresentation,
        "",
        customConfig,
        {} as MinimalGeneratorConfig
    );
    return generation.settings.defaultTimeoutInMilliseconds;
}

describe("C# default-timeout-in-seconds config", () => {
    it("should accept a positive number", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": 60 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe(60);
        }
    });

    it("should accept fractional seconds", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": 1.5 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe(1.5);
        }
    });

    it("should accept the literal 'infinity'", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": "infinity" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBe("infinity");
        }
    });

    it("should accept config without the option (optional)", () => {
        const result = CsharpConfigSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-seconds"]).toBeUndefined();
        }
    });

    it("should reject zero", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": 0 });
        expect(result.success).toBe(false);
    });

    it("should reject negative numbers", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": -1 });
        expect(result.success).toBe(false);
    });

    it("should reject other strings", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-seconds": "60" });
        expect(result.success).toBe(false);
    });
});

describe("C# default-timeout-in-milliseconds config", () => {
    it("should accept a positive number", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-milliseconds": 500 });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-milliseconds"]).toBe(500);
        }
    });

    it("should accept the literal 'infinity'", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-milliseconds": "infinity" });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data["default-timeout-in-milliseconds"]).toBe("infinity");
        }
    });

    it("should reject zero", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-milliseconds": 0 });
        expect(result.success).toBe(false);
    });

    it("should reject negative numbers", () => {
        const result = CsharpConfigSchema.safeParse({ "default-timeout-in-milliseconds": -1 });
        expect(result.success).toBe(false);
    });
});

describe("C# timeout resolution (milliseconds)", () => {
    it("should be undefined when neither key is set", () => {
        expect(resolveTimeoutInMilliseconds({})).toBeUndefined();
    });

    it("should use the milliseconds key directly when set", () => {
        expect(resolveTimeoutInMilliseconds({ "default-timeout-in-milliseconds": 500 })).toBe(500);
    });

    it("should convert the deprecated seconds key to milliseconds", () => {
        expect(resolveTimeoutInMilliseconds({ "default-timeout-in-seconds": 60 })).toBe(60_000);
    });

    it("should convert fractional seconds to milliseconds", () => {
        expect(resolveTimeoutInMilliseconds({ "default-timeout-in-seconds": 1.5 })).toBe(1500);
    });

    it("should preserve 'infinity' from the deprecated seconds key", () => {
        expect(resolveTimeoutInMilliseconds({ "default-timeout-in-seconds": "infinity" })).toBe("infinity");
    });

    it("should let the milliseconds key take precedence when both are set", () => {
        expect(
            resolveTimeoutInMilliseconds({
                "default-timeout-in-milliseconds": 500,
                "default-timeout-in-seconds": 60
            })
        ).toBe(500);
    });

    it("should produce equivalent output for the old and new keys", () => {
        expect(resolveTimeoutInMilliseconds({ "default-timeout-in-seconds": 30 })).toBe(
            resolveTimeoutInMilliseconds({ "default-timeout-in-milliseconds": 30_000 })
        );
    });
});
