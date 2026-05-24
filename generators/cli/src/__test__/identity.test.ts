import { describe, expect, it } from "vitest";
import { deriveBinaryName, toEnvVarPrefix, toKebabCase } from "../identity.js";
import type { IrSummary } from "../ir.js";

const emptyIr = (apiDisplayName: string | undefined = undefined): IrSummary => ({
    apiDisplayName,
    auth: { schemes: [] }
});

describe("toKebabCase", () => {
    it("lowercases and dashes a typical title", () => {
        expect(toKebabCase("Query Parameters API")).toBe("query-parameters-api");
    });

    it("normalizes underscores and mixed case", () => {
        expect(toKebabCase("ACME_Public_API_v3")).toBe("acme-public-api-v3");
    });

    it("strips leading/trailing whitespace and dashes, collapses runs", () => {
        expect(toKebabCase("  foo--Bar  ")).toBe("foo-bar");
    });

    it("strips punctuation entirely", () => {
        expect(toKebabCase("Acme, Inc. (2024) API!")).toBe("acme-inc-2024-api");
    });
});

describe("toEnvVarPrefix", () => {
    it("uppercases and underscores a kebab name", () => {
        expect(toEnvVarPrefix("acme-public")).toBe("ACME_PUBLIC");
    });

    it("single-word names just uppercase", () => {
        expect(toEnvVarPrefix("acme")).toBe("ACME");
    });
});

describe("deriveBinaryName", () => {
    it("customConfig.binaryName wins over IR apiDisplayName", () => {
        const name = deriveBinaryName({
            customConfig: { binaryName: "Acme CLI" },
            ir: emptyIr("Should Not Win")
        });
        expect(name).toBe("acme-cli");
    });

    it("falls back to IR apiDisplayName (kebab-cased)", () => {
        const name = deriveBinaryName({
            customConfig: {},
            ir: emptyIr("Close API")
        });
        expect(name).toBe("close-api");
    });

    it("throws clearly when neither override nor IR apiDisplayName is set", () => {
        expect(() => deriveBinaryName({ customConfig: {}, ir: emptyIr(undefined) })).toThrow(
            /Set `customConfig.binaryName`/
        );
    });

    it("empty/whitespace customConfig.binaryName falls through to IR apiDisplayName", () => {
        const name = deriveBinaryName({
            customConfig: { binaryName: "   " },
            ir: emptyIr("Some Spec")
        });
        expect(name).toBe("some-spec");
    });

    it("customConfig.binaryName with no alphanumeric chars throws — guards against an empty kebab-case fallthrough", () => {
        expect(() => deriveBinaryName({ customConfig: { binaryName: "!!!" }, ir: emptyIr("Fallback") })).toThrow(
            /contains no alphanumeric characters/
        );
    });

    it("IR apiDisplayName with no alphanumeric chars throws", () => {
        expect(() => deriveBinaryName({ customConfig: {}, ir: emptyIr("/// ///") })).toThrow(
            /contains no alphanumeric characters/
        );
    });
});
