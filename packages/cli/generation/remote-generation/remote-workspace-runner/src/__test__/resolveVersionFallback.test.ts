import { describe, expect, it } from "vitest";

import { buildSnippetsConfigForSdk, resolveVersionFallback } from "../runRemoteGenerationForGenerator.js";

describe("resolveVersionFallback", () => {
    it("returns the version when an explicit version is provided", () => {
        expect(resolveVersionFallback("1.2.3")).toBe("1.2.3");
    });

    it("returns undefined when resolvedVersion is undefined (no version provided)", () => {
        expect(resolveVersionFallback(undefined)).toBeUndefined();
    });

    it("returns undefined when resolvedVersion is 'AUTO' (uppercase)", () => {
        expect(resolveVersionFallback("AUTO")).toBeUndefined();
    });

    it("returns undefined when resolvedVersion is 'auto' (lowercase)", () => {
        expect(resolveVersionFallback("auto")).toBeUndefined();
    });

    it("returns undefined when resolvedVersion is 'Auto' (mixed case)", () => {
        expect(resolveVersionFallback("Auto")).toBeUndefined();
    });

    it("returns a pre-release version as-is", () => {
        expect(resolveVersionFallback("1.0.0-rc.1")).toBe("1.0.0-rc.1");
    });

    it("returns a v-prefixed version as-is (stripping is handled elsewhere)", () => {
        expect(resolveVersionFallback("v2.0.0")).toBe("v2.0.0");
    });
});

describe("buildSnippetsConfigForSdk", () => {
    it("builds a typed snippets payload for typescript", () => {
        expect(
            buildSnippetsConfigForSdk({
                language: "typescript",
                packageName: "@acme/sdk",
                version: "1.2.3"
            })
        ).toEqual({
            typescriptSdk: {
                package: "@acme/sdk",
                version: "1.2.3"
            }
        });
    });

    it("maps java package names to coordinates", () => {
        expect(
            buildSnippetsConfigForSdk({
                language: "java",
                packageName: "com.acme:sdk",
                version: "2.0.0"
            })
        ).toEqual({
            javaSdk: {
                coordinate: "com.acme:sdk",
                version: "2.0.0"
            }
        });
    });

    it("drops AUTO versions from snippet payloads", () => {
        expect(
            buildSnippetsConfigForSdk({
                language: "go",
                packageName: "github.com/acme/sdk",
                version: "AUTO"
            })
        ).toEqual({
            goSdk: {
                githubRepo: "github.com/acme/sdk",
                version: undefined
            }
        });
    });

    it("returns an empty object when language or package name is missing", () => {
        expect(
            buildSnippetsConfigForSdk({
                language: undefined,
                packageName: "@acme/sdk",
                version: "1.2.3"
            })
        ).toEqual({});
        expect(
            buildSnippetsConfigForSdk({
                language: "typescript",
                packageName: undefined,
                version: "1.2.3"
            })
        ).toEqual({});
    });
});
