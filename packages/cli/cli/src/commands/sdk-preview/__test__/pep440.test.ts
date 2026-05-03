import { describe, expect, it } from "vitest";
import { isValidPep440DevLocalVersion } from "../pep440.js";

describe("isValidPep440DevLocalVersion", () => {
    describe("valid versions", () => {
        it("accepts canonical dev + local segment shape we generate", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1710434700+feat.add.auth")).toBe(true);
        });

        it("accepts numeric branch names in local segment", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1710434700+123.numeric")).toBe(true);
        });

        it("accepts a single-segment local version", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+main")).toBe(true);
        });

        it("accepts release without dev or local", () => {
            expect(isValidPep440DevLocalVersion("0.0.1")).toBe(true);
        });

        it("accepts release with local but no dev", () => {
            expect(isValidPep440DevLocalVersion("0.0.1+local.id")).toBe(true);
        });

        it("accepts long-but-bounded local segments", () => {
            const long = "a".repeat(63);
            expect(isValidPep440DevLocalVersion(`0.0.1.dev1+${long}`)).toBe(true);
        });
    });

    describe("invalid versions", () => {
        it("rejects empty string", () => {
            expect(isValidPep440DevLocalVersion("")).toBe(false);
        });

        it("rejects hyphens in local segment (PEP 440 allows but we restrict)", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+feat-add-auth")).toBe(false);
        });

        it("rejects underscores in local segment (we restrict to dots)", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+feat_add_auth")).toBe(false);
        });

        it("rejects local segment with leading dot", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+.foo")).toBe(false);
        });

        it("rejects local segment with trailing dot", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+foo.")).toBe(false);
        });

        it("rejects empty local segment", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+")).toBe(false);
        });

        it("rejects uppercase in local segment (PEP 503 normalization)", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+Foo")).toBe(false);
        });

        it("rejects unicode in local segment", () => {
            expect(isValidPep440DevLocalVersion("0.0.1.dev1+caf\u00e9")).toBe(false);
        });

        it("rejects local segment longer than 64 chars", () => {
            const tooLong = "a".repeat(65);
            expect(isValidPep440DevLocalVersion(`0.0.1.dev1+${tooLong}`)).toBe(false);
        });
    });
});
