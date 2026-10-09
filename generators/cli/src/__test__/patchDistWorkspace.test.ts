import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import url from "url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
    addToStringArray,
    addWorkspaceMember,
    applyDistWorkspacePatch,
    applyHomebrewPatch,
    applyRustlsPatch,
    patchDistWorkspaceToml,
    removeWorkspaceMember,
    setDistKey
} from "../index.js";

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
        expect(patched).toContain('installers = ["shell", "powershell"]');
        expect(patched).not.toContain('"npm"');
        expect(patched).toContain("targets = [");
        expect(patched).toContain("aarch64-apple-darwin");
        expect(patched).toContain('install-path = "CARGO_HOME"');
    });

    it("strips npm from installers even if other fern-specific anchors are absent", () => {
        const withNpm = '[dist]\ninstallers = ["shell", "powershell", "npm"]\n';
        const patched = applyDistWorkspacePatch(withNpm);
        expect(patched).toContain('installers = ["shell", "powershell"]');
        expect(patched).not.toContain('"npm"');
    });

    it("strips the cli-sdk-only crates/pipeline-fixture workspace member that never ships to generated CLIs", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        expect(patched).not.toContain("pipeline-fixture");
        // the root crate member must survive
        expect(patched).toContain('members = ["cargo:."]');
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

describe("addWorkspaceMember", () => {
    it("prepends cargo: prefix to workspace member names", () => {
        const input = '[workspace]\nmembers = ["cargo:.", "cargo:crates/pipeline-fixture"]\n';
        const result = addWorkspaceMember(input, "my-api-types");
        expect(result).toContain('"cargo:my-api-types"');
        expect(result).not.toMatch(/"my-api-types"(?!])/);
    });

    it("adds multiple members with cargo: prefix", () => {
        let toml = '[workspace]\nmembers = ["cargo:."]\n';
        toml = addWorkspaceMember(toml, "close-api-types");
        toml = addWorkspaceMember(toml, "close-api-sdk");
        expect(toml).toContain('"cargo:close-api-types"');
        expect(toml).toContain('"cargo:close-api-sdk"');
    });

    it("creates [workspace] section with cargo: prefix when none exists", () => {
        const input = '[dist]\ncargo-dist-version = "0.31.0"\n';
        const result = addWorkspaceMember(input, "my-types");
        expect(result).toContain('[workspace]\nmembers = ["cargo:my-types"]');
    });

    it("adds members array with cargo: prefix to existing [workspace] without members", () => {
        const input = "[workspace]\n[dist]\n";
        const result = addWorkspaceMember(input, "my-types");
        expect(result).toContain('members = ["cargo:my-types"]');
    });
});

describe("removeWorkspaceMember", () => {
    it("removes the named member while preserving the others", () => {
        const input = '[workspace]\nmembers = ["cargo:.", "cargo:crates/pipeline-fixture"]\n';
        const result = removeWorkspaceMember(input, "cargo:crates/pipeline-fixture");
        expect(result).toContain('members = ["cargo:."]');
        expect(result).not.toContain("pipeline-fixture");
    });

    it("removes a member from the middle of the list without leaving dangling commas", () => {
        const input = '[workspace]\nmembers = ["cargo:.", "cargo:crates/pipeline-fixture", "cargo:close-api-types"]\n';
        const result = removeWorkspaceMember(input, "cargo:crates/pipeline-fixture");
        expect(result).toContain('members = ["cargo:.", "cargo:close-api-types"]');
    });

    it("is a no-op when the member is absent", () => {
        const input = '[workspace]\nmembers = ["cargo:."]\n';
        expect(removeWorkspaceMember(input, "cargo:crates/pipeline-fixture")).toBe(input);
    });

    it("is a no-op when there is no [workspace] members array", () => {
        const input = '[dist]\ncargo-dist-version = "0.31.0"\n';
        expect(removeWorkspaceMember(input, "cargo:crates/pipeline-fixture")).toBe(input);
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
        expect(result).not.toContain("pipeline-fixture");
        expect(result).toContain('cargo-dist-version = "0.31.0"');
    });

    it("no-op when dist-workspace.toml doesn't exist — doesn't crash if the SDK template ever drops the file", async () => {
        await expect(patchDistWorkspaceToml({ outputDir: tmpDir })).resolves.toBeUndefined();
    });
});

describe("applyRustlsPatch", () => {
    // Observed on a real release: both musl legs died in ~44s on
    // `openssl-sys` ("Could not find directory of OpenSSL installation"),
    // which skipped `host` and produced no GitHub Release at all.
    it("switches cargo-dist builds off the crate's native-tls default", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        expect(patched).toContain("default-features = false");
        expect(patched).toContain('features = ["rustls"]');
    });

    // rustls is what rescues musl from the openssl-sys build failure —
    // x86_64-musl went from dying in 44s to building clean.
    it("rescues the musl targets rather than dropping them", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        expect(patched).toContain("x86_64-unknown-linux-musl");
        expect(patched).toContain("aarch64-unknown-linux-musl");
    });

    it("is idempotent", () => {
        const once = applyRustlsPatch(TEMPLATE_DIST_TOML);
        expect(applyRustlsPatch(once)).toBe(once);
    });

    // Synthesising a [dist] table would turn a file with no release config
    // into one that has some.
    it("is a no-op when the file drives no cargo-dist build", () => {
        const minimal = '[workspace]\nmembers = ["cargo:."]\n';
        expect(applyRustlsPatch(minimal)).toBe(minimal);
    });
});

describe("targets", () => {
    // The npm workflow publishes a linux-arm64 binary for this target, so a
    // GitHub Release without it leaves ARM64 Linux users — Graviton, ARM
    // containers — on the glibc build.
    it("keeps every template target, including aarch64-musl", () => {
        const patched = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        for (const target of [
            "aarch64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-apple-darwin",
            "x86_64-unknown-linux-gnu",
            "x86_64-unknown-linux-musl",
            "x86_64-pc-windows-msvc"
        ]) {
            expect(patched).toContain(target);
        }
    });
});

describe("addToStringArray", () => {
    it("appends to installers while preserving the existing entries and order", () => {
        expect(addToStringArray('installers = ["shell", "powershell"]', "installers", "homebrew")).toBe(
            'installers = ["shell", "powershell", "homebrew"]'
        );
    });

    it("fills an empty array", () => {
        expect(addToStringArray("publish-jobs = []", "publish-jobs", "homebrew")).toBe('publish-jobs = ["homebrew"]');
    });

    it("is idempotent — a second call does not duplicate the entry", () => {
        const once = addToStringArray('installers = ["shell"]', "installers", "homebrew");
        expect(addToStringArray(once, "installers", "homebrew")).toBe(once);
    });

    it("is a no-op when the key is absent", () => {
        expect(addToStringArray("targets = []", "installers", "homebrew")).toBe("targets = []");
    });
});

describe("setDistKey", () => {
    it("appends the key to the end of the [dist] table", () => {
        expect(setDistKey('[dist]\nci = "github"\n', "tap", "acme/homebrew-tap")).toBe(
            '[dist]\nci = "github"\ntap = "acme/homebrew-tap"\n'
        );
    });

    it("replaces an existing key in place rather than appending a duplicate", () => {
        const result = setDistKey('[dist]\ntap = "old/homebrew-tap"\nci = "github"\n', "tap", "acme/homebrew-tap");
        expect(result).toBe('[dist]\ntap = "acme/homebrew-tap"\nci = "github"\n');
    });

    it("inserts before the next section header rather than leaking into it", () => {
        const result = setDistKey('[dist]\nci = "github"\n\n[other]\nx = 1\n', "tap", "acme/homebrew-tap");
        expect(result).toBe('[dist]\nci = "github"\ntap = "acme/homebrew-tap"\n\n[other]\nx = 1\n');
    });
});

describe("applyHomebrewPatch", () => {
    it("turns on the installer, the publish job, and the tap/formula keys", () => {
        const patched = applyHomebrewPatch(
            applyDistWorkspacePatch(TEMPLATE_DIST_TOML),
            { tap: "acme/homebrew-tap" },
            "acme-cli"
        );
        expect(patched).toContain('installers = ["shell", "powershell", "homebrew"]');
        expect(patched).toContain('publish-jobs = ["homebrew"]');
        expect(patched).toContain('tap = "acme/homebrew-tap"');
        // Formula defaults to the binary name so `brew install acme/tap/acme-cli`
        // matches the command the README advertises.
        expect(patched).toContain('formula = "acme-cli"');
    });

    it("prefers an explicit formula over the binary name", () => {
        const patched = applyHomebrewPatch(
            TEMPLATE_DIST_TOML,
            { tap: "acme/homebrew-tap", formula: "acme" },
            "acme-cli"
        );
        expect(patched).toContain('formula = "acme"');
        expect(patched).not.toContain('formula = "acme-cli"');
    });

    it("leaves the rest of the cargo-dist config untouched", () => {
        const base = applyDistWorkspacePatch(TEMPLATE_DIST_TOML);
        const patched = applyHomebrewPatch(base, { tap: "acme/homebrew-tap" }, "acme-cli");
        expect(patched).toContain('cargo-dist-version = "0.31.0"');
        expect(patched).toContain('windows-archive = ".zip"');
        expect(patched).toContain('targets = ["aarch64-apple-darwin"');
    });
});

describe("patchDistWorkspaceToml — distribution", () => {
    let outputDir: string;

    beforeEach(async () => {
        outputDir = await mkdtemp(path.join(os.tmpdir(), "distWorkspaceHomebrew-"));
        await writeFile(path.join(outputDir, "dist-workspace.toml"), TEMPLATE_DIST_TOML);
    });

    afterEach(async () => {
        await rm(outputDir, { recursive: true, force: true });
    });

    it("writes nothing homebrew-related when no distribution is configured", async () => {
        await patchDistWorkspaceToml({ outputDir, binaryName: "acme-cli" });
        const written = await readFile(path.join(outputDir, "dist-workspace.toml"), "utf-8");
        expect(written).toBe(applyDistWorkspacePatch(TEMPLATE_DIST_TOML));
        expect(written).not.toContain("homebrew");
        expect(written).not.toContain("tap =");
    });

    // runPipeline calls this twice: once bare, then again with the generated
    // crate names. The second call takes an early-return branch that only adds
    // workspace members — the homebrew keys written by the first call must
    // survive it, or they'd be silently dropped for every CLI with custom
    // commands (i.e. the default).
    it("preserves the homebrew keys across the later add-workspace-members call", async () => {
        await patchDistWorkspaceToml({
            outputDir,
            binaryName: "acme-cli",
            homebrew: { tap: "acme/homebrew-tap" }
        });
        await patchDistWorkspaceToml({
            outputDir,
            typesCrateName: "acme-cli-types",
            sdkCrateName: "acme-cli-sdk"
        });

        const written = await readFile(path.join(outputDir, "dist-workspace.toml"), "utf-8");
        expect(written).toContain('installers = ["shell", "powershell", "homebrew"]');
        expect(written).toContain('publish-jobs = ["homebrew"]');
        expect(written).toContain('tap = "acme/homebrew-tap"');
        expect(written).toContain('"cargo:acme-cli-types"');
        expect(written).toContain('"cargo:acme-cli-sdk"');
    });
});
