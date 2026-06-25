import { describe, expect, it } from "vitest";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { getGithubPublishConfig } from "../getGeneratorConfig.js";

describe("getGithubPublishConfig — NuGet OIDC detection", () => {
    it('treats apiKey "OIDC" as trusted publishing', () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage",
                apiKey: "OIDC"
            })
        );
        expect(result).toBeDefined();
        expect(result!.type).toBe("nuget");
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("<USE_OIDC>");
            expect(result.shouldGeneratePublishWorkflow).toBe(true);
        }
    });

    it('treats apiKey "<USE_OIDC>" as trusted publishing', () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage",
                apiKey: "<USE_OIDC>"
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("<USE_OIDC>");
            expect(result.shouldGeneratePublishWorkflow).toBe(true);
        }
    });

    it("treats a ${SECRET_NAME} apiKey as a regular secret reference", () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage",
                apiKey: "${MY_NUGET_KEY}"
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("MY_NUGET_KEY");
            expect(result.shouldGeneratePublishWorkflow).toBeUndefined();
        }
    });

    it("treats an empty apiKey as no key", () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage",
                apiKey: ""
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("");
            expect(result.shouldGeneratePublishWorkflow).toBeUndefined();
        }
    });

    it("treats undefined apiKey as no key", () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage"
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("");
            expect(result.shouldGeneratePublishWorkflow).toBeUndefined();
        }
    });

    it("trims whitespace around apiKey before checking for OIDC", () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage",
                apiKey: "  OIDC  "
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("<USE_OIDC>");
            expect(result.shouldGeneratePublishWorkflow).toBe(true);
        }
    });

    it("treats a plain string apiKey (not a secret ref) as empty env var", () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.nuget({
                registryUrl: "https://nuget.org",
                packageName: "MyPackage",
                apiKey: "some-literal-key"
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "nuget") {
            expect(result.apiKeyEnvironmentVariable).toBe("");
            expect(result.shouldGeneratePublishWorkflow).toBeUndefined();
        }
    });

    it("returns undefined for undefined input", () => {
        expect(getGithubPublishConfig(undefined)).toBeUndefined();
    });
});

describe("getGithubPublishConfig — npm OIDC detection (existing behavior)", () => {
    it('treats token "OIDC" as trusted publishing for npm', () => {
        const result = getGithubPublishConfig(
            FernFiddle.GithubPublishInfo.npm({
                registryUrl: "https://registry.npmjs.org",
                packageName: "@company/sdk",
                token: "OIDC"
            })
        );
        expect(result).toBeDefined();
        if (result?.type === "npm") {
            expect(result.tokenEnvironmentVariable).toBe("<USE_OIDC>");
            expect(result.shouldGeneratePublishWorkflow).toBe(true);
        }
    });
});
