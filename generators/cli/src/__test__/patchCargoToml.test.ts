import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import url from "url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyCargoTomlPatch, patchCargoToml } from "../index.js";

/**
 * Test against the real SDK template's `Cargo.toml`, not a hand-authored
 * copy. If the template ever reformats or the anchor strings drift,
 * these tests fail loudly — exactly when the patcher would silently
 * stop working in production.
 */
const SDK_CARGO_TOML_PATH = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../sdk/Cargo.toml");

let TEMPLATE_CARGO_TOML: string;
beforeAll(async () => {
    TEMPLATE_CARGO_TOML = await readFile(SDK_CARGO_TOML_PATH, "utf-8");
});

describe("applyCargoTomlPatch", () => {
    it("rewrites the openapi-fixture [[bin]] name + path to the derived binary name", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).toContain('name = "acme-cli"');
        expect(patched).toContain('path = "cli/acme-cli/main.rs"');
        expect(patched).not.toContain('name = "openapi-fixture"');
        expect(patched).not.toContain('"cli/openapi-fixture/main.rs"');
    });

    it("leaves the [package] name (fern-cli-sdk) untouched — Cargo.lock pins it and --locked would reject a rename", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).toContain('name = "fern-cli-sdk"');
    });

    it("leaves the [lib] name (fern_cli_sdk, snake_case) untouched — every src/ import depends on it", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).toContain('name = "fern_cli_sdk"');
    });

    it("strips the strip-schema [[bin]] block — Fern-internal CI helper, paired with src/bin/strip_schema.rs in SDK_IGNORE", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).not.toContain('name = "strip-schema"');
        expect(patched).not.toContain('path = "src/bin/strip_schema.rs"');
    });

    it("strips the openapi-31-fixture [[bin]] block — template-author dev bin, paired with cli/openapi-31-fixture/** in SDK_IGNORE", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).not.toContain('name = "openapi-31-fixture"');
        expect(patched).not.toContain('path = "cli/openapi-31-fixture/main.rs"');
    });

    it("strips the template-author comment about Fern's package metadata", () => {
        // The comment block at the top of the file is meant for SDK
        // template authors, not customers.
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).not.toContain("The fern-cli generator does NOT rewrite this block");
        expect(patched).not.toContain("identify the SDK template's source on crates.io");
    });

    it("strips the template-author comment above the [[bin]] block", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).not.toContain("Rewritten by the fern-cli generator's `patchCargoToml` step");
    });

    it('drops `readme = "README.md"` — no README ships in user output and the missing file breaks cargo package', () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).not.toContain('readme = "README.md"');
    });

    it("flips [package.metadata.dist] dist = false to true so cargo-dist will package the user's CLI", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).not.toContain("dist = false");
        expect(patched).toContain(`[package.metadata.dist]
dist = true`);
    });

    it("preserves dependency versions, the [features] block, and [profile.dist]", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).toContain('version = "0.18.1"');
        expect(patched).toContain('repository = "https://github.com/fern-api/cli-sdk"');
        expect(patched).toContain('anyhow = "1"');
        expect(patched).toContain('default = ["native-tls"]');
        expect(patched).toContain("[profile.dist]");
    });

    it("throws with a clear pointer when an anchor is missing — guards against silent template drift", () => {
        expect(() => applyCargoTomlPatch('[package]\nname = "unrelated"\n', "acme-cli")).toThrow(
            /patchCargoToml anchor missing/
        );
    });
});

describe("patchCargoToml (filesystem)", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "patchCargo-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("reads, patches, and writes Cargo.toml in the output dir", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), TEMPLATE_CARGO_TOML);

        await patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli" });

        const result = await readFile(path.join(tmpDir, "Cargo.toml"), "utf-8");
        expect(result).toContain('name = "acme-cli"');
        expect(result).toContain('path = "cli/acme-cli/main.rs"');
        expect(result).toContain("dist = true");
        expect(result).not.toContain('readme = "README.md"');
        expect(result).not.toContain('name = "strip-schema"');
    });

    it("throws when none of the template anchors are present", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), '[package]\nname = "unrelated"\n');

        await expect(patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli" })).rejects.toThrow(
            /anchor missing|did not match/
        );
    });
});
