import {
    CsharpConfigSchema,
    DIAGNOSTIC_PREFIX_PATTERN,
    FALLBACK_DIAGNOSTIC_PREFIX,
    getDiagnosticId,
    resolveDiagnosticPrefix
} from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

describe("resolveDiagnosticPrefix", () => {
    it("prefers an override that matches the prefix pattern", () => {
        expect(resolveDiagnosticPrefix({ override: "ACME", rootNamespace: "Square.Net" })).toBe("ACME");
        expect(resolveDiagnosticPrefix({ override: "SQUARE1", rootNamespace: "My.Company.Sdk" })).toBe("SQUARE1");
    });

    it("derives from the first namespace segment when no override is provided", () => {
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "Square.Net" })).toBe("SQUARE");
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "Twilio" })).toBe("TWILIO");
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "My.Company.Sdk" })).toBe("MY");
    });

    it("uppercases, strips non-alphanumerics, and truncates to 6 characters", () => {
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "BuildWithFern" })).toBe("BUILDW");
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "foo-bar.baz" })).toBe("FOOBAR");
    });

    it("falls back to FERN when the derived prefix fails the pattern", () => {
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "1Password.Sdk" })).toBe(
            FALLBACK_DIAGNOSTIC_PREFIX
        );
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "" })).toBe(FALLBACK_DIAGNOSTIC_PREFIX);
        expect(resolveDiagnosticPrefix({ override: undefined, rootNamespace: "42" })).toBe(FALLBACK_DIAGNOSTIC_PREFIX);
    });

    it("falls back to FERN when the override itself fails the pattern", () => {
        expect(resolveDiagnosticPrefix({ override: "lowercase", rootNamespace: "Square.Net" })).toBe("SQUARE");
        expect(resolveDiagnosticPrefix({ override: "1BAD", rootNamespace: "Square.Net" })).toBe("SQUARE");
        expect(resolveDiagnosticPrefix({ override: "TOOLONG123", rootNamespace: "1Password" })).toBe(
            FALLBACK_DIAGNOSTIC_PREFIX
        );
    });

    it("exposes a pattern that rejects lowercase letters and too-short values", () => {
        expect(DIAGNOSTIC_PREFIX_PATTERN.test("ACME")).toBe(true);
        expect(DIAGNOSTIC_PREFIX_PATTERN.test("A")).toBe(false);
        expect(DIAGNOSTIC_PREFIX_PATTERN.test("acme")).toBe(false);
        expect(DIAGNOSTIC_PREFIX_PATTERN.test("TOOLONG12")).toBe(false);
    });
});

describe("getDiagnosticId", () => {
    it("returns {prefix}0001 for InDevelopment", () => {
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.InDevelopment, prefix: "FERN" })).toBe("FERN0001");
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.InDevelopment, prefix: "ACME" })).toBe("ACME0001");
    });

    it("returns {prefix}0002 for PreRelease", () => {
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.PreRelease, prefix: "FERN" })).toBe("FERN0002");
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.PreRelease, prefix: "SQUARE" })).toBe("SQUARE0002");
    });

    it("returns undefined for Deprecated and GeneralAvailability", () => {
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.Deprecated, prefix: "FERN" })).toBeUndefined();
        expect(
            getDiagnosticId({ status: FernIr.AvailabilityStatus.GeneralAvailability, prefix: "FERN" })
        ).toBeUndefined();
    });
});

describe("CsharpConfigSchema — availabilityDiagnosticPrefix validation", () => {
    it("accepts a well-formed prefix", () => {
        const result = CsharpConfigSchema.safeParse({ availabilityDiagnosticPrefix: "ACME" });
        expect(result.success).toBe(true);
    });

    it("rejects a lowercase prefix", () => {
        const result = CsharpConfigSchema.safeParse({ availabilityDiagnosticPrefix: "lowercase" });
        expect(result.success).toBe(false);
    });

    it("rejects a prefix that is too long", () => {
        const result = CsharpConfigSchema.safeParse({ availabilityDiagnosticPrefix: "TOOLONG12" });
        expect(result.success).toBe(false);
    });

    it("rejects a prefix that starts with a digit", () => {
        const result = CsharpConfigSchema.safeParse({ availabilityDiagnosticPrefix: "1BAD" });
        expect(result.success).toBe(false);
    });

    it("accepts the field being omitted", () => {
        const result = CsharpConfigSchema.safeParse({});
        expect(result.success).toBe(true);
    });
});
