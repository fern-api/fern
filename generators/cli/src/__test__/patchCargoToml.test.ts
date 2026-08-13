import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import url from "url";
import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
    addSdkCrateToLock,
    addTypesCrateToLock,
    applyCargoTomlPatch,
    applyPackageIdentityPatch,
    parseGeneratedCrateManifest,
    patchCargoLockVersion,
    patchCargoToml,
    renameCargoLockPackage,
    renderLockDependencyList,
    withDistributionDefaults
} from "../patchCargoToml.js";

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
        expect(patched).toContain("default = []");
        expect(patched).toContain("[profile.dist]");
    });

    it("preserves the per-target TLS and keyring dependency tables", () => {
        const patched = applyCargoTomlPatch(TEMPLATE_CARGO_TOML, "acme-cli", "1.2.3");
        expect(patched).toContain(`[target.'cfg(target_env = "musl")'.dependencies]`);
        expect(patched).toContain(`[target.'cfg(not(target_env = "musl"))'.dependencies]`);
        // keyring is non-musl only: libdbus can't be statically linked.
        const muslSection = patched.slice(
            patched.indexOf(`[target.'cfg(target_env = "musl")'.dependencies]`),
            patched.indexOf(`[target.'cfg(not(target_env = "musl"))'.dependencies]`)
        );
        expect(muslSection).not.toContain("keyring");
        expect(muslSection).toContain("rustls-tls-native-roots");
    });

    it("throws with a clear pointer when an anchor is missing — guards against silent template drift", () => {
        expect(() => applyCargoTomlPatch('[package]\nname = "unrelated"\n', "acme-cli", "1.0.0")).toThrow(
            /patchCargoToml anchor missing/
        );
    });
});

describe("applyPackageIdentityPatch", () => {
    const IDENTITY = {
        name: "agentmail-cli",
        description: "AgentMail CLI",
        license: "MIT",
        repository: "https://github.com/agentmail-to/agentmail-cli-fern",
        homepage: "https://agentmail.to",
        authors: ["AgentMail <support@agentmail.cc>"],
        keywords: ["email", "agent"]
    };

    it("rewrites the [package] identity with the customer's metadata", () => {
        const patched = applyPackageIdentityPatch(TEMPLATE_CARGO_TOML, IDENTITY);
        expect(patched).toContain('name = "agentmail-cli"');
        expect(patched).toContain('description = "AgentMail CLI"');
        expect(patched).toContain('license = "MIT"');
        expect(patched).toContain('repository = "https://github.com/agentmail-to/agentmail-cli-fern"');
        expect(patched).toContain('homepage = "https://agentmail.to"');
        expect(patched).toContain('authors = ["AgentMail <support@agentmail.cc>"]');
        expect(patched).toContain('keywords = ["email", "agent"]');
        expect(patched).not.toContain('name = "fern-cli-sdk"');
        expect(patched).not.toContain('repository = "https://github.com/fern-api/cli-sdk"');
        expect(patched).not.toContain("hey@buildwithfern.com");
    });

    it("never renames the [lib] target — every `use fern_cli_sdk::...` in the vendored src/ depends on it", () => {
        const patched = applyPackageIdentityPatch(TEMPLATE_CARGO_TOML, IDENTITY);
        expect(patched).toContain('name = "fern_cli_sdk"');
        expect(patched).toContain('path = "src/lib.rs"');
    });

    it("leaves fields the customer didn't set at the template's values", () => {
        const patched = applyPackageIdentityPatch(TEMPLATE_CARGO_TOML, { name: "agentmail-cli" });
        expect(patched).toContain('license = "Apache-2.0"');
        expect(patched).toContain('authors = ["Fern <hey@buildwithfern.com>"]');
    });

    it("stays inside [package] — an identically named key in a later section is untouched", () => {
        const toml = '[package]\nname = "fern-cli-sdk"\n\n[dependencies.reqwest]\nversion = "0.12"\n';
        const patched = applyPackageIdentityPatch(toml, { name: "acme" });
        expect(patched).toContain('[package]\nname = "acme"');
        expect(patched).toContain('[dependencies.reqwest]\nversion = "0.12"');
    });

    it("appends a field the template doesn't ship", () => {
        const patched = applyPackageIdentityPatch('[package]\nname = "fern-cli-sdk"\n', {
            homepage: "https://agentmail.to"
        });
        expect(patched).toContain('homepage = "https://agentmail.to"');
    });

    it("escapes quotes and backslashes so a stray value can't break the manifest", () => {
        const patched = applyPackageIdentityPatch('[package]\nname = "fern-cli-sdk"\n', {
            description: 'a "quoted" \\ value'
        });
        expect(patched).toContain('description = "a \\"quoted\\" \\\\ value"');
    });

    it("escapes newlines and control characters that TOML forbids in a basic string", () => {
        const patched = applyPackageIdentityPatch('[package]\nname = "fern-cli-sdk"\n', {
            description: `Multi\nline\tvalue${String.fromCharCode(7)}`
        });
        expect(patched).toContain('description = "Multi\\nline\\tvalue\\u0007"');
        expect(patched.split("\n").filter((line) => line.startsWith("description"))).toHaveLength(1);
    });

    it("throws when the [package] section is missing", () => {
        expect(() => applyPackageIdentityPatch('[lib]\nname = "x"\n', { name: "acme" })).toThrow(
            /could not find the \[package\] section/
        );
    });
});

describe("renameCargoLockPackage", () => {
    it("renames the template's package entry so --locked still resolves the crate", () => {
        const patched = renameCargoLockPackage(TEMPLATE_CARGO_LOCK, "agentmail-cli");
        expect(patched).toContain('name = "agentmail-cli"');
        expect(patched).not.toContain('name = "fern-cli-sdk"');
    });

    it("throws when the template entry is absent", () => {
        expect(() => renameCargoLockPackage("version = 4\n", "acme")).toThrow(/could not find fern-cli-sdk/);
    });
});

describe("generated crate lockfile entries after a package rename", () => {
    const TYPES_MANIFEST = {
        version: "0.0.0",
        dependencies: [
            { name: "serde", versionReq: "1" },
            { name: "serde_json", versionReq: "1" }
        ]
    };
    const SDK_MANIFEST = {
        version: "0.1.0",
        dependencies: [
            { name: "agentmail_types", versionReq: undefined },
            { name: "serde", versionReq: "1.0" },
            { name: "tokio", versionReq: "1.0" }
        ]
    };

    it("adds the types crate to the renamed CLI crate's dependency list", () => {
        const renamed = renameCargoLockPackage(TEMPLATE_CARGO_LOCK, "agentmail-cli");
        const patched = addTypesCrateToLock(renamed, "agentmail-types", TYPES_MANIFEST, false, "agentmail-cli");
        const cliEntry = patched.slice(patched.indexOf('name = "agentmail-cli"'));
        expect(cliEntry.slice(0, cliEntry.indexOf("]"))).toContain('"agentmail_types"');
    });

    it("adds the SDK crate to the renamed CLI crate's dependency list", () => {
        const renamed = renameCargoLockPackage(TEMPLATE_CARGO_LOCK, "agentmail-cli");
        const patched = addSdkCrateToLock(renamed, "agentmail-sdk", "agentmail-types", SDK_MANIFEST, "agentmail-cli");
        const cliEntry = patched.slice(patched.indexOf('name = "agentmail-cli"'));
        expect(cliEntry.slice(0, cliEntry.indexOf("]"))).toContain('"agentmail_sdk"');
    });

    it("stamps the crate's real version, not a placeholder", () => {
        const renamed = renameCargoLockPackage(TEMPLATE_CARGO_LOCK, "agentmail-cli");
        const patched = addSdkCrateToLock(renamed, "agentmail-sdk", "agentmail-types", SDK_MANIFEST, "agentmail-cli");
        // A placeholder version made Cargo treat the stanza as a different
        // package and demand a lock update, breaking `--locked`.
        expect(patched).toContain('name = "agentmail_sdk"\nversion = "0.1.0"');
    });

    it("fails loudly when a generated crate needs a package the shipped lock lacks", () => {
        const renamed = renameCargoLockPackage(TEMPLATE_CARGO_LOCK, "agentmail-cli");
        expect(() =>
            addTypesCrateToLock(
                renamed,
                "agentmail-types",
                { version: "0.0.0", dependencies: [{ name: "totally-absent-crate", versionReq: "1" }] },
                false,
                "agentmail-cli"
            )
        ).toThrow(/totally-absent-crate/);
    });
});

describe("parseGeneratedCrateManifest", () => {
    it("reads the version and dependency names the Rust generators emit", () => {
        const manifest = parseGeneratedCrateManifest(
            [
                "[package]",
                'name = "api_sdk"',
                'version = "0.1.0"',
                'edition = "2021"',
                "",
                "[dependencies]",
                'base64 = "0.22"',
                'reqwest = { version = "0.12", features = ["json"], default-features = false }',
                'thiserror = "1.0"',
                "",
                "[dev-dependencies]",
                'tokio-test = "0.4"',
                "",
                "[features]",
                'default = ["multipart"]',
                "",
                "[dependencies.api_types]",
                'path = "../api-types"'
            ].join("\n")
        );

        expect(manifest.version).toBe("0.1.0");
        expect(manifest.dependencies.map((d) => d.name).sort()).toEqual([
            "api_types",
            "base64",
            "reqwest",
            "thiserror"
        ]);
        // Version requirements are needed to disambiguate a package the lock
        // holds two majors of.
        expect(manifest.dependencies.find((d) => d.name === "reqwest")?.versionReq).toBe("0.12");
        expect(manifest.dependencies.find((d) => d.name === "thiserror")?.versionReq).toBe("1.0");
    });
});

describe("renderLockDependencyList", () => {
    const LOCK_WITH_TWO_THISERRORS = [
        "[[package]]",
        'name = "thiserror"',
        'version = "1.0.69"',
        "",
        "[[package]]",
        'name = "thiserror"',
        'version = "2.0.3"',
        "",
        "[[package]]",
        'name = "serde"',
        'version = "1.0.0"',
        ""
    ].join("\n");

    it("version-qualifies a package the lock holds more than one major of", () => {
        const refs = renderLockDependencyList(
            LOCK_WITH_TWO_THISERRORS,
            [
                { name: "thiserror", versionReq: "1.0" },
                { name: "serde", versionReq: "1" }
            ],
            []
        );
        // Cargo writes `"thiserror 1.0.69"` when the name alone is ambiguous,
        // and a bare name when it is not.
        expect(refs).toEqual(["serde", "thiserror 1.0.69"]);
    });

    it("exempts sibling generated crates, which are appended in the same pass", () => {
        const refs = renderLockDependencyList(
            LOCK_WITH_TWO_THISERRORS,
            [{ name: "acme_types", versionReq: undefined }],
            ["acme_types"]
        );
        expect(refs).toEqual(["acme_types"]);
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

    it("applies the customer's package identity to Cargo.toml and Cargo.lock together", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), TEMPLATE_CARGO_TOML);
        await writeFile(path.join(tmpDir, "Cargo.lock"), TEMPLATE_CARGO_LOCK);

        await patchCargoToml({
            outputDir: tmpDir,
            binaryName: "agentmail",
            version: "2.0.0",
            packageIdentity: {
                name: "agentmail-cli",
                repository: "https://github.com/agentmail-to/agentmail-cli-fern",
                authors: ["AgentMail <support@agentmail.cc>"]
            }
        });

        const result = await readFile(path.join(tmpDir, "Cargo.toml"), "utf-8");
        expect(result).toContain('name = "agentmail-cli"');
        expect(result).toContain('name = "agentmail"'); // the [[bin]] entry
        expect(result).toContain('name = "fern_cli_sdk"'); // the [lib] entry
        expect(result).not.toContain('name = "fern-cli-sdk"');
        expect(result).not.toContain("hey@buildwithfern.com");

        const lockResult = await readFile(path.join(tmpDir, "Cargo.lock"), "utf-8");
        expect(lockResult).toContain('name = "agentmail-cli"\nversion = "2.0.0"');
        expect(lockResult).not.toContain('name = "fern-cli-sdk"');
    });

    it("keeps Fern's package identity when the customer sets none", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), TEMPLATE_CARGO_TOML);
        await writeFile(path.join(tmpDir, "Cargo.lock"), TEMPLATE_CARGO_LOCK);

        await patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli", version: "2.0.0" });

        const result = await readFile(path.join(tmpDir, "Cargo.toml"), "utf-8");
        expect(result).toContain('name = "fern-cli-sdk"');
    });

    it("throws when none of the template anchors are present", async () => {
        await writeFile(path.join(tmpDir, "Cargo.toml"), '[package]\nname = "unrelated"\n');
        await writeFile(path.join(tmpDir, "Cargo.lock"), TEMPLATE_CARGO_LOCK);

        await expect(patchCargoToml({ outputDir: tmpDir, binaryName: "acme-cli", version: "1.0.0" })).rejects.toThrow(
            /anchor missing|did not match/
        );
    });
});

describe("withDistributionDefaults", () => {
    const repoUrl = "https://github.com/acme/acme-cli";
    const description = "CLI for the Acme API";
    const base = { publishesHomebrew: true, repoUrl, description };

    // The load-bearing one: cargo-dist builds the formula's per-arch release
    // download URLs from `repository`. Left at the template's value every
    // `brew install` 404s against github.com/fern-api/cli-sdk.
    it("points repository, homepage and description at the consumer", () => {
        expect(withDistributionDefaults({ ...base, packageIdentity: undefined })).toEqual({
            repository: repoUrl,
            homepage: repoUrl,
            description
        });
    });

    it("preserves the other identity fields it fills alongside", () => {
        expect(withDistributionDefaults({ ...base, packageIdentity: { name: "acme-cli", license: "MIT" } })).toEqual({
            name: "acme-cli",
            license: "MIT",
            repository: repoUrl,
            homepage: repoUrl,
            description
        });
    });

    it("never overrides values the consumer pinned", () => {
        expect(
            withDistributionDefaults({
                ...base,
                packageIdentity: {
                    repository: "https://github.com/acme/other",
                    homepage: "https://acme.com",
                    description: "Mine"
                }
            })
        ).toEqual({
            repository: "https://github.com/acme/other",
            homepage: "https://acme.com",
            description: "Mine"
        });
    });

    // Scoped to the Homebrew case: applying it unconditionally would change
    // the Cargo.toml of every existing github-mode generation.
    it("is inert when Homebrew is off", () => {
        const packageIdentity = { name: "acme-cli" };
        expect(withDistributionDefaults({ ...base, publishesHomebrew: false, packageIdentity })).toBe(packageIdentity);
        expect(
            withDistributionDefaults({ ...base, publishesHomebrew: false, packageIdentity: undefined })
        ).toBeUndefined();
    });

    it("fills only what it can when the repo url is unknown", () => {
        expect(withDistributionDefaults({ ...base, repoUrl: undefined, packageIdentity: undefined })).toEqual({
            description
        });
    });
});
