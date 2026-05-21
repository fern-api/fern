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

    it("leaves the strip-schema [[bin]] entry untouched — internal tool, not the user's CLI", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).toContain('name = "strip-schema"');
        expect(patched).toContain('path = "src/bin/strip_schema.rs"');
    });

    it("substitutes literally — preserves all other lines verbatim", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli");
        expect(patched).toContain('version = "0.18.1"');
        expect(patched).toContain('repository = "https://github.com/fern-api/cli-sdk"');
        expect(patched).toContain('anyhow = "1"');
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
    });

    it("throws when none of the template anchors are present — guards against silent no-ops", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), '[package]\nname = "unrelated"\n');

        await expect(patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli" })).rejects.toThrow(
            /did not match the expected template/
        );
    });
});
