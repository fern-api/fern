import { readFile, writeFile } from "fs/promises";
import path from "path";
import { TEMPLATE_BINARY_NAME } from "./identity.js";

/**
 * Rewrite the shipped Cargo.toml so the bundled CLI binary has the
 * user's chosen name and the file looks like a fresh customer-facing
 * project — no leaked template-author commentary, no broken `readme`
 * reference, and not blocked from cargo-dist out of the box.
 *
 * The substitutions are anchored to literal strings the SDK template
 * ships with. If any anchor is missing the function throws, so a
 * future template refactor surfaces a generator error rather than
 * silently producing stale output.
 *
 * What changes:
 *   - `[[bin]] name = "openapi-fixture"`            →  `[[bin]] name = "<binaryName>"`
 *   - `[[bin]] path = "cli/openapi-fixture/main.rs"` → `[[bin]] path = "cli/<binaryName>/main.rs"`
 *   - `readme = "README.md"`                        →  (removed; no README ships in user output)
 *   - `[package.metadata.dist] dist = false`        →  `dist = true`
 *   - the entire `[[bin]] strip-schema` block       →  (removed; CI helper, not the user's CLI)
 *   - the two template-author comment blocks at the
 *     top of [package] and above the openapi-fixture
 *     [[bin]]                                       →  (removed; meant for SDK template authors)
 *
 * What stays:
 *   - `[package] name = "fern-cli-sdk"` — pinned by the shipped
 *     Cargo.lock; renaming would break `cargo build --locked`.
 *   - `[lib] name = "fern_cli_sdk"` — every `use fern_cli_sdk::...`
 *     in the shipped src/ tree depends on it.
 *   - All dependency versions, features, and the `[profile.dist]` block.
 */
export async function patchCargoToml(args: { outputDir: string; binaryName: string; version: string }): Promise<void> {
    const { outputDir, binaryName, version } = args;
    const cargoTomlPath = path.join(outputDir, "Cargo.toml");
    const contents = await readFile(cargoTomlPath, "utf-8");
    const patched = applyCargoTomlPatch(contents, binaryName, version);
    if (patched === contents) {
        throw new Error(
            `Cargo.toml at ${cargoTomlPath} did not match the expected template — no substitutions made. ` +
                "Did the SDK template's identity tokens change?"
        );
    }
    await writeFile(cargoTomlPath, patched);
}

/**
 * Pure transformation. Exported for unit-test access. Throws on
 * partial matches so any drift between the template's anchors and the
 * patcher's expectations becomes a test failure rather than a silent
 * skip.
 */
export function applyCargoTomlPatch(cargoToml: string, binaryName: string, version: string): string {
    let patched = cargoToml;
    patched = requireReplace(patched, TEMPLATE_TOP_COMMENT, "");
    patched = requireReplace(patched, TEMPLATE_BIN_COMMENT, "");
    patched = requireReplace(patched, STRIP_SCHEMA_BIN_BLOCK, "");
    patched = requireReplace(patched, README_FIELD, "");
    patched = requireReplace(patched, METADATA_DIST_FALSE, METADATA_DIST_TRUE);
    patched = requireReplace(patched, `name = "${TEMPLATE_BINARY_NAME}"`, `name = "${binaryName}"`);
    patched = requireReplace(
        patched,
        `path = "cli/${TEMPLATE_BINARY_NAME}/main.rs"`,
        `path = "cli/${binaryName}/main.rs"`
    );
    patched = replaceVersion(patched, version);
    return patched;
}

/**
 * Replace the template's `version = "..."` field under `[package]`
 * with the resolved version. Uses a regex anchored to the `[package]`
 * section so it won't accidentally match version fields inside
 * `[dependencies]`. Safe for `cargo build --locked` — changing
 * `[package] version` does not alter the dependency graph in
 * `Cargo.lock`.
 */
function replaceVersion(cargoToml: string, version: string): string {
    const versionRe = /^(version\s*=\s*)"[^"]*"/m;
    if (!versionRe.test(cargoToml)) {
        throw new Error('patchCargoToml anchor missing — could not find version = "..." field');
    }
    return cargoToml.replace(versionRe, `$1"${version}"`);
}

function requireReplace(haystack: string, needle: string, replacement: string): string {
    if (!haystack.includes(needle)) {
        throw new Error(`patchCargoToml anchor missing — could not find ${JSON.stringify(needle.slice(0, 60))}`);
    }
    return haystack.replace(needle, replacement);
}

const TEMPLATE_TOP_COMMENT = `# \`name\`, \`repository\`, \`homepage\`, \`authors\`, and \`keywords\` are Fern's —
# they identify the SDK template's source on crates.io. The fern-cli
# generator does NOT rewrite this block when producing your CLI; only the
# [[bin]] entry below is templated. If you want to publish *your* CLI as
# its own crate on crates.io, edit this block to your org's metadata.
# The [lib] name (\`fern_cli_sdk\`) is the import path every \`use
# fern_cli_sdk::...\` site in src/ depends on — do NOT rename it.
`;

const TEMPLATE_BIN_COMMENT = `# Rewritten by the fern-cli generator's \`patchCargoToml\` step — both the
# \`name\` and \`path\` are replaced with the derived binary name so users
# get \`cargo install\`-able binaries named after their API rather than
# the template's literal "openapi-fixture".
`;

const STRIP_SCHEMA_BIN_BLOCK = `# Internal tool used by the SDK template itself — not the user's CLI.
[[bin]]
name = "strip-schema"
path = "src/bin/strip_schema.rs"

`;

const README_FIELD = `readme = "README.md"\n`;

const METADATA_DIST_FALSE = `[package.metadata.dist]
dist = false`;

const METADATA_DIST_TRUE = `[package.metadata.dist]
dist = true`;
