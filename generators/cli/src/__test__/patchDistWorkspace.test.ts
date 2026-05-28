import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import url from "url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyDistWorkspacePatch, patchDistWorkspaceToml } from "../index.js";

const SDK_DIST_WORKSPACE_PATH = path.resolve(
    path.dirname(url.fileURLToPath(import.meta.url)),
    "../../sdk/dist-workspace.toml"
);

let TEMPLATE_DIST_TOML: string;
beforeAll(async () => {
    TEMPLATE_DIST_TOML = await readFile(SDK_DIST_WORKSPACE_PATH, "utf-8");
});

describe("applyDistWorkspacePatch", () => {
    it("strips the @fern-api npm scope so cargo-dist doesn't try to publish under Fern's namespace", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        expect(patched).not.toContain('npm-scope = "@fern-api"');
        expect(patched).not.toContain("A namespace to use when publishing this package to the npm registry");
    });

    it("strips the cli-sdk npm package name", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        expect(patched).not.toContain('npm-package = "cli-sdk"');
        expect(patched).not.toContain("The npm package should have this name");
    });

    it("preserves the rest of the cargo-dist config (targets, installers, archive formats, profile)", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        expect(patched).toContain("[workspace]");
        expect(patched).toContain('cargo-dist-version = "0.31.0"');
        expect(patched).toContain('ci = "github"');
        expect(patched).toContain('installers = ["shell", "powershell", "npm"]');
        expect(patched).toContain("targets = [");
        expect(patched).toContain("aarch64-apple-darwin");
        expect(patched).toContain('install-path = "CARGO_HOME"');
    });

    it("is idempotent — running twice produces the same output as once", () => {
        const once = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        const twice = applyDistWorkspacePatch(once);
        expect(twice).toBe(once);
    });

    it("returns input unchanged when the anchors aren't present", () => {
        const minimal = '[workspace]\nmembers = ["cargo:."]\n';
        expect(applyDistWorkspacePatch(minimal)).toBe(minimal);
    });
});

describe("patchDistWorkspaceToml (filesystem)", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "patchDistWorkspace-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("reads, patches, and writes dist-workspace.toml in the output dir", async () => {
        await writeFile(path.join(tmpDir, "dist-workspace.toml"), TEMPLATE_DIST_TOML);

        await patchDistWorkspaceToml({ outputDir: tmpDir });

        const result = await readFile(path.join(tmpDir, "dist-workspace.toml"), "utf-8");
        expect(result).not.toContain("@fern-api");
        expect(result).not.toContain("cli-sdk");
        expect(result).toContain('cargo-dist-version = "0.31.0"');
    });

    it("no-op when dist-workspace.toml doesn't exist — doesn't crash if the SDK template ever drops the file", async () => {
        await expect(patchDistWorkspaceToml({ outputDir: tmpDir })).resolves.toBeUndefined();
    });
});
