import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import url from "url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyCargoTomlPatch, patchCargoLockVersion, patchCargoToml } from "../index.js";

/**
 * Test against the real SDK template's `Cargo.toml`, not a hand-authored
 * copy. If the template ever reformats or the anchor strings drift,
 * these tests fail loudly — exactly when the patcher would silently
 * stop working in production.
 */
const SDK_DIR = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "../../sdk");
const SDK_CARGO_TOML_PATH = path.join(SDK_DIR, "Cargo.toml");
const SDK_CARGO_LOCK_PATH = path.join(SDK_DIR, "Cargo.lock");

let TEMPLATE_CARGO_TOML: string;
let TEMPLATE_CARGO_LOCK: string;
beforeAll(async () => {
    TEMPLATE_CARGO_TOML = await readFile(SDK_CARGO_TOML_PATH, "utf-8");
    TEMPLATE_CARGO_LOCK = await readFile(SDK_CARGO_LOCK_PATH, "utf-8");
});

describe("applyCargoTomlPatch", () => {
    it("rewrites the openapi-fixture [[bin]] name + path to the derived binary name", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).toContain('name = "acme-cli"');
        expect(patched).toContain('path = "cli/acme-cli/main.rs"');
        expect(patched).not.toContain('name = "openapi-fixture"');
        expect(patched).not.toContain('"cli/openapi-fixture/main.rs"');
    });

    it("leaves the [package] name (fern-cli-sdk) untouched — Cargo.lock pins it and --locked would reject a rename", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).toContain('name = "fern-cli-sdk"');
    });

    it("leaves the [lib] name (fern_cli_sdk, snake_case) untouched — every src/ import depends on it", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).toContain('name = "fern_cli_sdk"');
    });

    it("strips the strip-schema [[bin]] block — Fern-internal CI helper, paired with src/bin/strip_schema.rs in SDK_IGNORE", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).not.toContain('name = "strip-schema"');
        expect(patched).not.toContain('path = "src/bin/strip_schema.rs"');
    });

    it("strips the template-author comment about Fern's package metadata", () => {
        // The comment block at the top of the file is meant for SDK
        // template authors, not customers.
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).not.toContain("The fern-cli generator does NOT rewrite this block");
        expect(patched).not.toContain("identify the SDK template's source on crates.io");
    });

    it("strips the template-author comment above the [[bin]] block", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).not.toContain("Rewritten by the fern-cli generator's `patchCargoToml` step");
    });

    it('drops `readme = "README.md"` — no README ships in user output and the missing file breaks cargo package', () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).not.toContain('readme = "README.md"');
    });

    it("flips [package.metadata.dist] dist = false to true so cargo-dist will package the user's CLI", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).not.toContain("dist = false");
        expect(patched).toContain(`[package.metadata.dist]
dist = true`);
    });

    it("stamps the resolved version into [package] version", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).toContain('version = "1.2.3"');
        expect(patched).not.toContain('version = "0.18.1"');
    });

    it("preserves dependency versions, the [features] block, and [profile.dist]", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).toContain('repository = "https://github.com/fern-api/cli-sdk"');
        expect(patched).toContain('anyhow = "1"');
        expect(patched).toContain('default = ["native-tls"]');
        expect(patched).toContain("[profile.dist]");
    });

    it("throws with a clear pointer when an anchor is missing — guards against silent template drift", () => {
        expect(() => applyCargoTomlPatch('[package]\nname = "unrelated"\n', "acme-cli", "1.0.0")).toThrow(
            /patchCargoToml anchor missing/
        );
    });
});

describe("patchCargoLockVersion", () => {
    it("replaces the fern-cli-sdk version in Cargo.lock", () => {
        const patched = patchCargoLockVersion(TEMPLATE_CARGO_LOCK, "3.0.0");
        expect(patched).toContain('name = "fern-cli-sdk"\nversion = "3.0.0"');
        expect(patched).not.toContain('name = "fern-cli-sdk"\nversion = "0.18.1"');
    });

    it("throws when fern-cli-sdk entry is missing", () => {
        expect(() => patchCargoLockVersion("version = 4\n", "1.0.0")).toThrow(/could not find fern-cli-sdk/);
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

    it("reads, patches, and writes Cargo.toml and Cargo.lock in the output dir", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), TEMPLATE_CARGO_TOML);
        await writeFile(path.join(tmpDir, "Cargo.lock"), TEMPLATE_CARGO_LOCK);

        await patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli", version: "2.0.0" });

        const result = await readFile(path.join(tmpDir, "Cargo.toml"), "utf-8");
        expect(result).toContain('name = "acme-cli"');
        expect(result).toContain('path = "cli/acme-cli/main.rs"');
        expect(result).toContain("dist = true");
        expect(result).not.toContain('readme = "README.md"');
        expect(result).not.toContain('name = "strip-schema"');

        const lockResult = await readFile(path.join(tmpDir, "Cargo.lock"), "utf-8");
        expect(lockResult).toContain('name = "fern-cli-sdk"\nversion = "2.0.0"');
        expect(lockResult).not.toContain('name = "fern-cli-sdk"\nversion = "0.18.1"');
    });

    it("throws when none of the template anchors are present", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), '[package]\nname = "unrelated"\n');
        await writeFile(path.join(tmpDir, "Cargo.lock"), TEMPLATE_CARGO_LOCK);

        await expect(patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli", version: "1.0.0" })).rejects.toThrow(
            /anchor missing|did not match/
        );
    });
});
