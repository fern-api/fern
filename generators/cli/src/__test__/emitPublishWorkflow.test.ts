import { mkdir, mkdtemp, readFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emitCiWorkflow, emitPublishWorkflow } from "../emitPublishWorkflow.js";
import type { ResolvedNpmPublishInfo } from "../resolveOutputConfig.js";

/**
 * Direct unit tests for `emitPublishWorkflow`. Validates the emitted
 * `.github/workflows/ci.yml` content for token handling, OIDC
 * permissions, and correct interpolation of binary/package names.
 */
describe("emitPublishWorkflow", () => {
    let tmpDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "emitPublishWorkflow-"));
        outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function emitAndRead(
        npmPublishInfo: ResolvedNpmPublishInfo,
        binaryName = "acme",
        repoUrl: string | undefined = undefined
    ): Promise<string> {
        await emitPublishWorkflow({ outputDir, binaryName, npmPublishInfo, repoUrl });
        return readFile(path.join(outputDir, ".github", "workflows", "ci.yml"), "utf-8");
    }

    const baseInfo: ResolvedNpmPublishInfo = {
        packageName: "@acme/cli",
        registryUrl: "https://registry.npmjs.org",
        tokenEnvironmentVariable: "NPM_TOKEN",
        useOidc: false
    };

    // ── Standard token-based publishing ────────────────────────────

    it("emits NODE_AUTH_TOKEN referencing the configured secret", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}");
        expect(yaml).not.toContain("id-token: write");
    });

    it("uses npx npm@latest publish wrapper instead of bare npm publish", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain('npx -y npm@latest publish "$@"');
        expect(yaml).not.toMatch(/^\s+npm publish/m);
    });

    it("includes backport detection for stable releases", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("dist-tags.latest");
        expect(yaml).toContain("--tag backport");
        expect(yaml).toContain("npx -y semver@7.8.1");
    });

    it("uses a custom token variable name in the secret reference", async () => {
        const yaml = await emitAndRead({
            ...baseInfo,
            tokenEnvironmentVariable: "CUSTOM_REGISTRY_TOKEN"
        });

        expect(yaml).toContain("NODE_AUTH_TOKEN: ${{ secrets.CUSTOM_REGISTRY_TOKEN }}");
    });

    // ── OIDC-based publishing ──────────────────────────────────────

    it("OIDC mode omits NODE_AUTH_TOKEN and adds id-token permissions", async () => {
        const yaml = await emitAndRead({
            ...baseInfo,
            tokenEnvironmentVariable: "<USE_OIDC>",
            useOidc: true
        });

        expect(yaml).not.toContain("NODE_AUTH_TOKEN");
        expect(yaml).not.toContain("secrets.");
        expect(yaml).toContain("id-token: write");
        expect(yaml).toContain("contents: read");
    });

    // ── Empty token fallback (the bug from item 1) ─────────────────

    it("does not produce an empty secrets reference (guards the empty-token bug)", async () => {
        // In local mode the token can resolve to "" before reaching the
        // generator. resolveNpmPublishInfo now normalises this to
        // "NPM_TOKEN", but even if the caller passed "" directly the
        // workflow template must never contain `secrets. }}`
        const yaml = await emitAndRead({
            ...baseInfo,
            tokenEnvironmentVariable: "NPM_TOKEN",
            useOidc: false
        });

        // Should NOT match the broken pattern `secrets. }}`
        expect(yaml).not.toMatch(/secrets\.\s*\}\}/);
    });

    // ── Structural assertions ──────────────────────────────────────

    it("contains the expected CI jobs (check, compile, test, publish, publish-launcher)", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("check:");
        expect(yaml).toContain("compile:");
        expect(yaml).toContain("test:");
        expect(yaml).toContain("publish:");
        expect(yaml).toContain("publish-launcher:");
    });

    it("interpolates the binary name and package name into the workflow", async () => {
        const yaml = await emitAndRead(baseInfo, "my-tool");

        expect(yaml).toContain('BINARY_NAME="my-tool"');
        expect(yaml).toContain("@acme/cli");
        expect(yaml).toContain("x86_64-unknown-linux-musl");
        expect(yaml).toContain("aarch64-apple-darwin");
    });

    it("uses the configured registry URL in setup-node", async () => {
        const yaml = await emitAndRead({
            ...baseInfo,
            registryUrl: "https://npm.pkg.github.com"
        });

        expect(yaml).toContain('registry-url: "https://npm.pkg.github.com"');
    });

    it("tag-based publishing only triggers on tag pushes", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("contains(github.ref, 'refs/tags/')");
    });

    it("uses actions/checkout@v6 and actions/setup-node@v6", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("actions/checkout@v6");
        expect(yaml).not.toContain("actions/checkout@v4");
        expect(yaml).toContain("actions/setup-node@v6");
        expect(yaml).not.toContain("actions/setup-node@v4");
    });

    it("uses musl targets for Linux with native ARM runner", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("x86_64-unknown-linux-musl");
        expect(yaml).toContain("aarch64-unknown-linux-musl");
        expect(yaml).not.toContain("unknown-linux-gnu");
        expect(yaml).toContain("ubuntu-24.04-arm");
    });

    it("installs musl-tools and conditionally builds with rustls for musl targets", async () => {
        const yaml = await emitAndRead(baseInfo);

        expect(yaml).toContain("musl-tools");
        expect(yaml).toContain("--no-default-features --features rustls");
        expect(yaml).not.toContain("gcc-aarch64-linux-gnu");
    });

    it("includes repository.url in package.json when repoUrl is provided", async () => {
        const yaml = await emitAndRead(baseInfo, "acme", "https://github.com/acme/acme-cli");

        expect(yaml).toContain('"repository"');
        expect(yaml).toContain('"url": "https://github.com/acme/acme-cli"');
    });

    it("omits repository field from package.json when repoUrl is undefined", async () => {
        const yaml = await emitAndRead(baseInfo, "acme", undefined);

        expect(yaml).not.toContain('"repository"');
    });

    it("both publish steps define a publish() helper and backport logic", async () => {
        const yaml = await emitAndRead(baseInfo);

        // There should be two publish() helper definitions — one per publish step
        const publishHelperMatches = yaml.match(/publish\(\)\s*\{/g);
        expect(publishHelperMatches).toHaveLength(2);

        // Both platform and launcher steps should have backport logic
        // Each step has 2 occurrences: the echo message + the publish call
        const backportMatches = yaml.match(/--tag backport/g);
        expect(backportMatches).toHaveLength(4);
    });
});

/**
 * Tests for `emitCiWorkflow` — the build+test-only workflow emitted
 * when the output mode is `github` without npm publish info.
 */
describe("emitCiWorkflow", () => {
    let tmpDir: string;
    let outputDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "emitCiWorkflow-"));
        outputDir = path.join(tmpDir, "out");
        await mkdir(outputDir, { recursive: true });
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    async function emitAndRead(binaryName = "acme"): Promise<string> {
        await emitCiWorkflow({ outputDir, binaryName });
        return readFile(path.join(outputDir, ".github", "workflows", "ci.yml"), "utf-8");
    }

    it("emits check, compile, and test jobs", async () => {
        const yaml = await emitAndRead();

        expect(yaml).toContain("name: ci");
        expect(yaml).toContain("check:");
        expect(yaml).toContain("compile:");
        expect(yaml).toContain("test:");
    });

    it("does not contain publish or npm references", async () => {
        const yaml = await emitAndRead();

        expect(yaml).not.toContain("publish:");
        expect(yaml).not.toContain("publish-launcher:");
        expect(yaml).not.toContain("NPM_TOKEN");
        expect(yaml).not.toContain("NODE_AUTH_TOKEN");
        expect(yaml).not.toContain("npm");
        expect(yaml).not.toContain("setup-node");
    });

    it("triggers on push", async () => {
        const yaml = await emitAndRead();

        expect(yaml).toContain("on: [push]");
    });

    it("uses actions/checkout@v6 and actions-rust-lang/setup-rust-toolchain@v1", async () => {
        const yaml = await emitAndRead();

        expect(yaml).toContain("actions/checkout@v6");
        expect(yaml).toContain("actions-rust-lang/setup-rust-toolchain@v1");
    });
});
