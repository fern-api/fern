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
 * When `typesCrateName` is supplied (second call), the function adds a
 * `[dependencies.<typesCrateName>]` path dep pointing at the generated
 * types crate workspace member.
 *
 * When `packageIdentity` is supplied, the `[package]` block's crate name
 * and publish metadata are rewritten to the customer's own values (see
 * {@link applyPackageIdentityPatch}), and the lockfile's package entry is
 * renamed in lockstep so `cargo build --locked` still resolves.
 *
 * What stays:
 *   - `[package] name = "fern-cli-sdk"` — unless `packageIdentity.name`
 *     overrides it; the shipped Cargo.lock pins the name, so a rename
 *     has to patch both files together.
 *   - `[lib] name = "fern_cli_sdk"` — every `use fern_cli_sdk::...`
 *     in the shipped src/ tree depends on it, so it is never renamed.
 *   - All dependency versions, features, and the `[profile.dist]` block.
 */
export async function patchCargoToml(args: {
    outputDir: string;
    binaryName: string;
    version?: string;
    typesCrateName?: string;
    sdkCrateName?: string;
    packageIdentity?: CargoPackageIdentity;
}): Promise<void> {
    const { outputDir, binaryName, version, typesCrateName, sdkCrateName, packageIdentity } = args;
    const cargoTomlPath = path.join(outputDir, "Cargo.toml");
    const contents = await readFile(cargoTomlPath, "utf-8");

    if (typesCrateName != null || sdkCrateName != null) {
        let patched = contents;
        if (sdkCrateName != null) {
            // The SDK crate re-exports all types via its prelude, so it
            // is the single entry point for custom commands — no need
            // for a separate types dependency on the CLI binary.
            patched = addCrateDependency(patched, sdkCrateName);
        } else if (typesCrateName != null) {
            patched = addCrateDependency(patched, typesCrateName);
        }
        await writeFile(cargoTomlPath, patched);
        return;
    }

    const patched = applyCargoTomlPatch(contents, binaryName, version ?? "0.0.0", packageIdentity);
    if (patched === contents) {
        throw new Error(
            `Cargo.toml at ${cargoTomlPath} did not match the expected template — no substitutions made. ` +
                "Did the SDK template's identity tokens change?"
        );
    }
    await writeFile(cargoTomlPath, patched);

    // Cargo.lock records the package's own version alongside its
    // dependencies.  When we stamp a resolved version into Cargo.toml,
    // the lockfile entry must match — otherwise `cargo build --locked`
    // rejects the build.
    const packageName = packageIdentity?.name;
    if (version != null || packageName != null) {
        const cargoLockPath = path.join(outputDir, "Cargo.lock");
        const lockContents = await readFile(cargoLockPath, "utf-8");
        let patchedLock = lockContents;
        if (version != null) {
            patchedLock = patchCargoLockVersion(patchedLock, version);
        }
        if (packageName != null) {
            patchedLock = renameCargoLockPackage(patchedLock, packageName);
        }
        await writeFile(cargoLockPath, patchedLock);
    }
}

/**
 * Customer-supplied `[package]` identity for the generated crate. Every
 * field is optional; absent fields keep the SDK template's value.
 */
export interface CargoPackageIdentity {
    name?: string;
    description?: string;
    license?: string;
    repository?: string;
    homepage?: string;
    authors?: string[];
    keywords?: string[];
}

/** The crate name the SDK template ships with. */
export const TEMPLATE_PACKAGE_NAME = "fern-cli-sdk";

/**
 * Rewrite the `[package]` block's identity fields with the customer's
 * values. Scoped to the `[package]` section so a `repository` key inside
 * a dependency table is never touched, and deliberately blind to `[lib]`
 * — `fern_cli_sdk` is the import path the vendored `src/` tree uses.
 *
 * Only fields present on `identity` are rewritten.
 */
export function applyPackageIdentityPatch(cargoToml: string, identity: CargoPackageIdentity): string {
    const sectionStart = cargoToml.indexOf(PACKAGE_SECTION_HEADER);
    if (sectionStart === -1) {
        throw new Error("patchCargoToml anchor missing — could not find the [package] section");
    }
    const afterHeader = sectionStart + PACKAGE_SECTION_HEADER.length;
    const nextSection = cargoToml.indexOf("\n[", afterHeader);
    const sectionEnd = nextSection === -1 ? cargoToml.length : nextSection;
    let section = cargoToml.slice(sectionStart, sectionEnd);

    const scalars: [string, string | undefined][] = [
        ["name", identity.name],
        ["description", identity.description],
        ["license", identity.license],
        ["repository", identity.repository],
        ["homepage", identity.homepage]
    ];
    for (const [field, value] of scalars) {
        if (value != null) {
            section = upsertField(section, field, `${field} = ${toTomlString(value)}`);
        }
    }

    const arrays: [string, string[] | undefined][] = [
        ["authors", identity.authors],
        ["keywords", identity.keywords]
    ];
    for (const [field, values] of arrays) {
        if (values != null) {
            section = upsertField(section, field, `${field} = [${values.map(toTomlString).join(", ")}]`);
        }
    }

    return cargoToml.slice(0, sectionStart) + section + cargoToml.slice(sectionEnd);
}

/**
 * Replace a `<field> = ...` line inside the `[package]` section,
 * appending it when the template doesn't ship the field.
 */
function upsertField(section: string, field: string, line: string): string {
    const pattern = new RegExp(`^${field}\\s*=\\s*(?:"[^"]*"|\\[[^\\]]*\\])`, "m");
    if (pattern.test(section)) {
        return section.replace(pattern, line);
    }
    return `${section.trimEnd()}\n${line}\n`;
}

/** TOML basic string, escaping backslashes and double quotes. */
function toTomlString(value: string): string {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

/**
 * Rename the template's own `[[package]]` entry in Cargo.lock. Cargo
 * matches the workspace member by name, so a `[package] name` override in
 * Cargo.toml without this leaves `cargo build --locked` unable to resolve
 * the crate.
 */
export function renameCargoLockPackage(cargoLock: string, packageName: string): string {
    const anchor = `name = "${TEMPLATE_PACKAGE_NAME}"`;
    if (!cargoLock.includes(anchor)) {
        throw new Error(`patchCargoToml: could not find ${TEMPLATE_PACKAGE_NAME} entry in Cargo.lock`);
    }
    return cargoLock.split(anchor).join(`name = "${packageName}"`);
}

/**
 * Pure transformation. Exported for unit-test access. Throws on
 * partial matches so any drift between the template's anchors and the
 * patcher's expectations becomes a test failure rather than a silent
 * skip.
 */
export function applyCargoTomlPatch(
    cargoToml: string,
    binaryName: string,
    version: string,
    packageIdentity?: CargoPackageIdentity
): string {
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
    if (packageIdentity != null) {
        patched = applyPackageIdentityPatch(patched, packageIdentity);
    }
    return patched;
}

/**
 * Append a `[dependencies.<crateName>]` path dependency to the
 * Cargo.toml, linking the CLI crate to a generated workspace member.
 * Used for both the types crate and the SDK crate.
 */
export function addCrateDependency(cargoToml: string, crateName: string): string {
    const snakeName = crateName.replace(/-/g, "_");
    const depBlock = `\n[dependencies.${snakeName}]\npath = "${crateName}"\n`;
    // Append before [profile] sections if present, else at the end.
    const profileIdx = cargoToml.indexOf("\n[profile.");
    if (profileIdx !== -1) {
        return cargoToml.slice(0, profileIdx) + depBlock + cargoToml.slice(profileIdx);
    }
    return cargoToml + depBlock;
}

/** @deprecated Use {@link addCrateDependency} instead. */
export function addTypesDependency(cargoToml: string, typesCrateName: string): string {
    return addCrateDependency(cargoToml, typesCrateName);
}

/**
 * Replace the template's `version = "..."` field under `[package]`
 * with the resolved version. Uses a regex anchored to the first
 * occurrence so it won't accidentally match version fields inside
 * `[dependencies]`.
 */
function replaceVersion(cargoToml: string, version: string): string {
    const versionRe = /^(version\s*=\s*)"[^"]*"/m;
    if (!versionRe.test(cargoToml)) {
        throw new Error('patchCargoToml anchor missing — could not find version = "..." field');
    }
    return cargoToml.replace(versionRe, `$1"${version}"`);
}

/**
 * Patch the `version` field of the `fern-cli-sdk` package entry in
 * Cargo.lock to match the version stamped into Cargo.toml. Cargo.lock
 * records each package as:
 *
 *   [[package]]
 *   name = "fern-cli-sdk"
 *   version = "0.18.1"
 *
 * We locate the `fern-cli-sdk` entry and replace its version.
 */
export function patchCargoLockVersion(cargoLock: string, version: string): string {
    const pattern = /(name = "fern-cli-sdk"\nversion = ")([^"]*)(")/;
    if (!pattern.test(cargoLock)) {
        throw new Error("patchCargoToml: could not find fern-cli-sdk version entry in Cargo.lock");
    }
    return cargoLock.replace(pattern, `$1${version}$3`);
}

/**
 * Patch Cargo.lock to include the generated types crate as a workspace
 * member. `cargo build --locked` requires the lock file to be
 * consistent with `Cargo.toml` — adding a new `[dependencies.X]` path
 * dep without a corresponding `[[package]]` entry causes a rejection.
 *
 * The types crate's dependencies (`serde`, `serde_json`, `chrono`,
 * `base64`, `num-bigint`, `ordered-float`) are already resolved in
 * the lock file from the CLI SDK's own dep tree, so we only need to:
 *   1. Append a `[[package]]` entry for the types crate itself.
 *   2. Add the types crate to `fern-cli-sdk`'s dependency list.
 */
export async function patchCargoLockForTypes(args: {
    outputDir: string;
    typesCrateName: string;
    /** When true, skip adding the types crate to the CLI crate's dep list
     *  (e.g. when the SDK crate is the direct dep instead). */
    skipCliDep?: boolean;
    /** The CLI crate's name in the lockfile, when renamed via `packageIdentity`. */
    packageName?: string;
}): Promise<void> {
    const { outputDir, typesCrateName, skipCliDep, packageName } = args;
    const lockPath = path.join(outputDir, "Cargo.lock");
    const contents = await readFile(lockPath, "utf-8");
    const patched = addTypesCrateToLock(contents, typesCrateName, skipCliDep, packageName);
    await writeFile(lockPath, patched);
}

/**
 * Pure transformation for unit-test access.
 */
export function addTypesCrateToLock(
    cargoLock: string,
    typesCrateName: string,
    skipCliDep?: boolean,
    packageName: string = TEMPLATE_PACKAGE_NAME
): string {
    const snakeName = typesCrateName.replace(/-/g, "_");

    // 1. Append [[package]] entry for the types crate (sorted insertion
    //    isn't strictly required by Cargo, but we append at the end for
    //    simplicity — Cargo accepts any order).
    const packageEntry = [
        "",
        "[[package]]",
        `name = "${snakeName}"`,
        'version = "0.0.0"',
        "dependencies = [",
        ' "base64",',
        ' "chrono",',
        ' "num-bigint",',
        ' "ordered-float",',
        ' "serde",',
        ' "serde_json",',
        "]",
        ""
    ].join("\n");

    let patched = cargoLock.trimEnd() + "\n" + packageEntry;

    // 2. Add the types crate to fern-cli-sdk's dependency list
    //    (skipped when the SDK crate is the direct dep instead).
    if (skipCliDep !== true) {
        const sdkDepsPattern = cliCrateDepsPattern(packageName);
        const match = patched.match(sdkDepsPattern);
        if (match != null) {
            const fullMatch = match[0];
            const prefix = match[1] ?? "";
            const depsBody = match[2] ?? "";
            const depLine = ` "${snakeName}",`;
            // Parse existing deps and insert in sorted order.
            const lines = depsBody.split("\n").filter((l) => l.trim().length > 0);
            lines.push(depLine);
            lines.sort((a, b) => a.trim().localeCompare(b.trim()));
            const newDepsBody = "\n" + lines.join("\n") + "\n";
            patched = patched.replace(fullMatch, prefix + newDepsBody + match[3]);
        }
    }

    return patched;
}

/**
 * Patch Cargo.lock to include the generated SDK crate as a workspace
 * member. Same pattern as `patchCargoLockForTypes`, but the SDK crate's
 * dependency list is different: it depends on the types crate plus
 * reqwest, serde, serde_json, tokio, and futures (all already resolved
 * in the lock file from the CLI SDK's own dep tree).
 */
export async function patchCargoLockForSdk(args: {
    outputDir: string;
    sdkCrateName: string;
    typesCrateName: string;
    /** The CLI crate's name in the lockfile, when renamed via `packageIdentity`. */
    packageName?: string;
}): Promise<void> {
    const { outputDir, sdkCrateName, typesCrateName, packageName } = args;
    const lockPath = path.join(outputDir, "Cargo.lock");
    const contents = await readFile(lockPath, "utf-8");
    const patched = addSdkCrateToLock(contents, sdkCrateName, typesCrateName, packageName);
    await writeFile(lockPath, patched);
}

/**
 * Pure transformation for unit-test access.
 */
export function addSdkCrateToLock(
    cargoLock: string,
    sdkCrateName: string,
    typesCrateName: string,
    packageName: string = TEMPLATE_PACKAGE_NAME
): string {
    const sdkSnakeName = sdkCrateName.replace(/-/g, "_");
    const typesSnakeName = typesCrateName.replace(/-/g, "_");

    // 1. Append [[package]] entry for the SDK crate. Its dependencies
    //    include the types crate plus the HTTP client stack that the
    //    rust-sdk generator pulls in (all already in the lockfile).
    const packageEntry = [
        "",
        "[[package]]",
        `name = "${sdkSnakeName}"`,
        'version = "0.0.0"',
        "dependencies = [",
        ` "${typesSnakeName}",`,
        ' "futures",',
        ' "reqwest",',
        ' "serde",',
        ' "serde_json",',
        ' "tokio",',
        "]",
        ""
    ].join("\n");

    let patched = cargoLock.trimEnd() + "\n" + packageEntry;

    // 2. Add the SDK crate to the CLI crate's dependency list.
    const sdkDepsPattern = cliCrateDepsPattern(packageName);
    const match = patched.match(sdkDepsPattern);
    if (match != null) {
        const fullMatch = match[0];
        const prefix = match[1] ?? "";
        const depsBody = match[2] ?? "";
        const depLine = ` "${sdkSnakeName}",`;
        const lines = depsBody.split("\n").filter((l) => l.trim().length > 0);
        lines.push(depLine);
        lines.sort((a, b) => a.trim().localeCompare(b.trim()));
        const newDepsBody = "\n" + lines.join("\n") + "\n";
        patched = patched.replace(fullMatch, prefix + newDepsBody + match[3]);
    }

    return patched;
}

/**
 * Matches the CLI crate's own `[[package]]` entry in Cargo.lock, capturing
 * its `dependencies = [...]` body so a generated crate can be spliced in.
 */
function cliCrateDepsPattern(packageName: string): RegExp {
    return new RegExp(`(name = "${packageName}"\\nversion = "[^"]*"\\ndependencies = \\[)([\\s\\S]*?)(\\])`);
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

const PACKAGE_SECTION_HEADER = "[package]";

const METADATA_DIST_FALSE = `[package.metadata.dist]
dist = false`;

const METADATA_DIST_TRUE = `[package.metadata.dist]
dist = true`;
