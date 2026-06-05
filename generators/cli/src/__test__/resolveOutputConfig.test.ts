import { FernGeneratorExec } from "@fern-api/base-generator";
import { describe, expect, it } from "vitest";
import { type ResolvedNpmPublishInfo, resolveOutputConfig } from "../resolveOutputConfig.js";

/**
 * Direct unit tests for `resolveOutputConfig`. Exercises every output
 * mode variant and the npm-publish-info edge cases (empty token,
 * OIDC sentinel, shouldGeneratePublishWorkflow: false).
 *
 * Uses the `FernGeneratorExec` SDK constructors (`OutputMode.github`,
 * `GithubPublishInfo.npm`, `EnvironmentVariable`) so that test inputs
 * carry the `_visit` methods the union types require.
 */
describe("resolveOutputConfig", () => {
    const env = FernGeneratorExec.EnvironmentVariable;

    function githubOutput(args: {
        version: string;
        publishInfo?: FernGeneratorExec.GithubPublishInfo;
    }): FernGeneratorExec.GeneratorOutputConfig {
        return {
            path: "/out",
            mode: FernGeneratorExec.OutputMode.github({
                version: args.version,
                repoUrl: "https://github.com/acme/cli",
                publishInfo: args.publishInfo
            })
        };
    }

    // ── output mode: github ────────────────────────────────────────

    it("github mode with npm publishInfo returns version + npmPublishInfo", () => {
        const result = resolveOutputConfig(
            githubOutput({
                version: "2.0.0",
                publishInfo: FernGeneratorExec.GithubPublishInfo.npm({
                    packageName: "@acme/cli",
                    registryUrl: "https://registry.npmjs.org",
                    tokenEnvironmentVariable: env("MY_NPM_TOKEN"),
                    shouldGeneratePublishWorkflow: true
                })
            })
        );

        expect(result.version).toBe("2.0.0");
        expect(result.isGithubOutput).toBe(true);
        expect(result.npmPublishInfo).toEqual<ResolvedNpmPublishInfo>({
            packageName: "@acme/cli",
            registryUrl: "https://registry.npmjs.org",
            tokenEnvironmentVariable: "MY_NPM_TOKEN",
            useOidc: false
        });
    });

    it("github mode without publishInfo returns version + isGithubOutput true + no npmPublishInfo", () => {
        const result = resolveOutputConfig(githubOutput({ version: "1.0.0" }));

        expect(result.version).toBe("1.0.0");
        expect(result.isGithubOutput).toBe(true);
        expect(result.npmPublishInfo).toBeUndefined();
    });

    // ── output mode: downloadFiles ─────────────────────────────────

    it("downloadFiles mode returns default version with isGithubOutput false", () => {
        const result = resolveOutputConfig({
            path: "/out",
            mode: FernGeneratorExec.OutputMode.downloadFiles()
        });

        expect(result.version).toBe("0.0.0");
        expect(result.isGithubOutput).toBe(false);
        expect(result.npmPublishInfo).toBeUndefined();
    });

    // ── npm publish info edge cases ────────────────────────────────

    it("empty tokenEnvironmentVariable falls back to NPM_TOKEN", () => {
        const result = resolveOutputConfig(
            githubOutput({
                version: "1.0.0",
                publishInfo: FernGeneratorExec.GithubPublishInfo.npm({
                    packageName: "@acme/cli",
                    registryUrl: "https://registry.npmjs.org",
                    tokenEnvironmentVariable: env(""),
                    shouldGeneratePublishWorkflow: true
                })
            })
        );

        expect(result.npmPublishInfo).toBeDefined();
        expect(result.npmPublishInfo?.tokenEnvironmentVariable).toBe("NPM_TOKEN");
        expect(result.npmPublishInfo?.useOidc).toBe(false);
    });

    it("<USE_OIDC> sentinel sets useOidc = true and preserves the sentinel value", () => {
        const result = resolveOutputConfig(
            githubOutput({
                version: "1.0.0",
                publishInfo: FernGeneratorExec.GithubPublishInfo.npm({
                    packageName: "@acme/cli",
                    registryUrl: "https://registry.npmjs.org",
                    tokenEnvironmentVariable: env("<USE_OIDC>"),
                    shouldGeneratePublishWorkflow: true
                })
            })
        );

        expect(result.npmPublishInfo).toBeDefined();
        expect(result.npmPublishInfo?.tokenEnvironmentVariable).toBe("<USE_OIDC>");
        expect(result.npmPublishInfo?.useOidc).toBe(true);
    });

    it("shouldGeneratePublishWorkflow: false suppresses npm publish info", () => {
        const result = resolveOutputConfig(
            githubOutput({
                version: "1.0.0",
                publishInfo: FernGeneratorExec.GithubPublishInfo.npm({
                    packageName: "@acme/cli",
                    registryUrl: "https://registry.npmjs.org",
                    tokenEnvironmentVariable: env("NPM_TOKEN"),
                    shouldGeneratePublishWorkflow: false
                })
            })
        );

        expect(result.npmPublishInfo).toBeUndefined();
    });

    it("non-npm publish type (maven) is ignored by the CLI generator", () => {
        const result = resolveOutputConfig(
            githubOutput({
                version: "1.0.0",
                publishInfo: FernGeneratorExec.GithubPublishInfo.maven({
                    registryUrl: "https://maven.example.com",
                    coordinate: "com.acme:cli",
                    usernameEnvironmentVariable: env("MAVEN_USER"),
                    passwordEnvironmentVariable: env("MAVEN_PASS")
                })
            })
        );

        expect(result.npmPublishInfo).toBeUndefined();
    });
});
