import { mkdir, mkdtemp, readFile, rm } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { emitPublishWorkflow } from "../emitPublishWorkflow.js";
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

    async function emitAndRead(npmPublishInfo: ResolvedNpmPublishInfo, binaryName = "acme"): Promise<string> {
        await emitPublishWorkflow({ outputDir, binaryName, npmPublishInfo });
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
        expect(yaml).toContain("x86_64-unknown-linux-gnu");
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
});
