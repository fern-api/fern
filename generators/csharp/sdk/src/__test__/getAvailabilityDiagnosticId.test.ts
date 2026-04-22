import {
    CsharpConfigSchema,
    DIAGNOSTIC_PREFIX_PATTERN,
    getDiagnosticId,
    resolveDiagnosticPrefix
} from "@fern-api/csharp-codegen";
import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

describe("resolveDiagnosticPrefix", () => {
    it("prefers an override that matches the prefix pattern", () => {
        expect(
            resolveDiagnosticPrefix({
                override: "ACME",
                rootNamespace: "Square.Net",
                organization: "square",
                workspaceName: "net"
            })
        ).toBe("ACME");
        expect(
            resolveDiagnosticPrefix({
                override: "SQUARE1",
                rootNamespace: "My.Company.Sdk",
                organization: "my",
                workspaceName: "company"
            })
        ).toBe("SQUARE1");
    });

    it("derives from the full root namespace when no override is provided", () => {
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "Square.Net",
                organization: "square",
                workspaceName: "net"
            })
        ).toBe("SQUARE");
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "Twilio",
                organization: "twilio",
                workspaceName: "twilio"
            })
        ).toBe("TWILIO");
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "My.Company.Sdk",
                organization: "my",
                workspaceName: "company"
            })
        ).toBe("MYCOMP");
    });

    it("uppercases, strips non-alphanumerics, and truncates to 6 characters", () => {
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "BuildWithFern",
                organization: "buildwithfern",
                workspaceName: "sdk"
            })
        ).toBe("BUILDW");
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "foo-bar.baz",
                organization: "foo",
                workspaceName: "bar"
            })
        ).toBe("FOOBAR");
    });

    it("strips leading digits from the derived prefix", () => {
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "1Password.Sdk",
                organization: "1password",
                workspaceName: "sdk"
            })
        ).toBe("PASSWO");
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "42",
                organization: "example",
                workspaceName: "api"
            })
        ).toBe("EXAMPL");
    });

    it("falls back to organization + workspaceName when rootNamespace sanitizes to empty", () => {
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "",
                organization: "acme",
                workspaceName: "widgets"
            })
        ).toBe("ACMEWI");
        // rootNamespace made entirely of leading digits strips to empty → falls back
        expect(
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "123",
                organization: "acme",
                workspaceName: "widgets"
            })
        ).toBe("ACMEWI");
    });

    it("throws when no input yields a valid prefix rather than emitting a Fern-branded literal", () => {
        expect(() =>
            resolveDiagnosticPrefix({
                override: undefined,
                rootNamespace: "",
                organization: "",
                workspaceName: ""
            })
        ).toThrow(/availabilityDiagnosticPrefix/);
        expect(() =>
            resolveDiagnosticPrefix({
                override: "lowercase",
                rootNamespace: "",
                organization: "",
                workspaceName: ""
            })
        ).toThrow(/availabilityDiagnosticPrefix/);
    });

    it("falls through to derivation when the override itself fails the pattern", () => {
        expect(
            resolveDiagnosticPrefix({
                override: "lowercase",
                rootNamespace: "Square.Net",
                organization: "square",
                workspaceName: "net"
            })
        ).toBe("SQUARE");
        expect(
            resolveDiagnosticPrefix({
                override: "1BAD",
                rootNamespace: "Square.Net",
                organization: "square",
                workspaceName: "net"
            })
        ).toBe("SQUARE");
        expect(
            resolveDiagnosticPrefix({
                override: "TOOLONG123",
                rootNamespace: "1Password",
                organization: "1password",
                workspaceName: "sdk"
            })
        ).toBe("PASSWO");
    });

    it("never returns the Fern-branded literal on any resolution path", () => {
        const cases = [
            { rootNamespace: "Square.Net", organization: "square", workspaceName: "net" },
            { rootNamespace: "1Password.Sdk", organization: "1password", workspaceName: "sdk" },
            { rootNamespace: "My.Company.Sdk", organization: "my", workspaceName: "company" },
            { rootNamespace: "", organization: "acme", workspaceName: "widgets" },
            { rootNamespace: "42", organization: "example", workspaceName: "api" }
        ];
        for (const c of cases) {
            expect(resolveDiagnosticPrefix({ override: undefined, ...c })).not.toBe("FERN");
        }
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
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.InDevelopment, prefix: "ACME" })).toBe("ACME0001");
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.InDevelopment, prefix: "SQUARE" })).toBe(
            "SQUARE0001"
        );
    });

    it("returns {prefix}0002 for PreRelease", () => {
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.PreRelease, prefix: "ACME" })).toBe("ACME0002");
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.PreRelease, prefix: "SQUARE" })).toBe("SQUARE0002");
    });

    it("returns undefined for Deprecated and GeneralAvailability", () => {
        expect(getDiagnosticId({ status: FernIr.AvailabilityStatus.Deprecated, prefix: "ACME" })).toBeUndefined();
        expect(
            getDiagnosticId({ status: FernIr.AvailabilityStatus.GeneralAvailability, prefix: "ACME" })
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
