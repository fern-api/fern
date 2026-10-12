import { FernGeneratorExec } from "@fern-api/base-generator";
import { describe, expect, it } from "vitest";
import { type ResolvedNpmPublishInfo, resolveOutputConfig, resolveRequestedVersion } from "../resolveOutputConfig.js";

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
        expect(result.repoUrl).toBe("https://github.com/acme/cli");
        expect(result.npmPublishInfo).toBeUndefined();
    });

    // ── output mode: downloadFiles ─────────────────────────────────

    it("downloadFiles mode resolves no version when none was requested", () => {
        const result = resolveOutputConfig({
            path: "/out",
            mode: FernGeneratorExec.OutputMode.downloadFiles()
        });

        expect(result.version).toBeUndefined();
        expect(result.isGithubOutput).toBe(false);
        expect(result.npmPublishInfo).toBeUndefined();
    });

    // Local-file-system output (direct generators.yml and SDK Config alike)
    // runs in downloadFiles mode, whose config has no version slot; the
    // `--version` / `sdkVersion` value reaches the generator only through the
    // IR's `generationMetadata.requestedVersion`.
    it("downloadFiles mode takes the IR's requested version", () => {
        const result = resolveOutputConfig(
            { path: "/out", mode: FernGeneratorExec.OutputMode.downloadFiles() },
            "2.3.4"
        );

        expect(result.version).toBe("2.3.4");
    });

    it("output mode version wins over the IR's requested version", () => {
        const result = resolveOutputConfig(githubOutput({ version: "1.0.0" }), "2.3.4");

        expect(result.version).toBe("1.0.0");
    });

    it.each(["AUTO", "v1.2.3", "1.2", "latest", ""])("ignores a requested version Cargo would reject: %j", (raw) => {
        const result = resolveOutputConfig({ path: "/out", mode: FernGeneratorExec.OutputMode.downloadFiles() }, raw);

        expect(result.version).toBeUndefined();
    });

    it.each(["0.0.1", "7.8.9", "1.0.0-rc.1", "1.0.0+build.5"])("accepts a semver requested version: %j", (raw) => {
        expect(resolveRequestedVersion(raw)).toBe(raw);
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
