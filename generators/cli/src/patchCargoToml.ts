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
 * Point the crate's `[package]` identity at the consumer when a Homebrew
 * formula will be published and they didn't pin these fields themselves.
 *
 * `packageIdentity` only rewrites the fields you set, so anything unset
 * keeps the SDK template's Fern-owned value. That is harmless while it
 * only lives in a `Cargo.toml` nobody reads — but cargo-dist renders the
 * published `.rb` straight off this block, and each field lands
 * somewhere different:
 *
 * | `[package]`   | Where it surfaces in the formula          |
 * |---------------|-------------------------------------------|
 * | `repository`  | the per-arch **release download URLs**     |
 * | `homepage`    | `homepage "..."`                          |
 * | `description` | `desc "..."`                              |
 *
 * `repository` is the load-bearing one: left at the template's value the
 * formula's `url`s resolve to `github.com/fern-api/cli-sdk/releases/...`,
 * where the consumer's archives do not exist — so every `brew install`
 * 404s. The other two are cosmetic but publish Fern's branding on the
 * consumer's own tap.
 *
 * Scoped to the Homebrew case on purpose: applying it unconditionally
 * would change the `Cargo.toml` of every existing github-mode
 * generation, which is exactly the silent-default churn the
 * breaking-changes policy exists to prevent. Explicit values always win.
 *
 * Scoop needs no equivalent — its manifest reads `repoUrl` and the
 * resolved asset name directly rather than going through `[package]`.
 */
export function withDistributionDefaults(args: {
    packageIdentity: CargoPackageIdentity | undefined;
    publishesHomebrew: boolean;
    repoUrl: string | undefined;
    /** Fallback `desc` for the formula, e.g. "CLI for the Acme API". */
    description: string | undefined;
}): CargoPackageIdentity | undefined {
    const { packageIdentity, publishesHomebrew, repoUrl, description } = args;
    if (!publishesHomebrew) {
        return packageIdentity;
    }
    const resolved: CargoPackageIdentity = { ...packageIdentity };
    if (repoUrl != null) {
        resolved.repository ??= repoUrl;
        resolved.homepage ??= repoUrl;
    }
    if (description != null) {
        resolved.description ??= description;
    }
    return Object.keys(resolved).length > 0 ? resolved : packageIdentity;
}

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

/**
 * TOML basic string. Escapes backslashes, double quotes, and the control
 * characters TOML forbids inside a basic string — a raw newline from a
 * YAML block scalar would otherwise make the manifest unparseable.
 */
function toTomlString(value: string): string {
    const escaped = Array.from(value, (char) => {
        const code = char.charCodeAt(0);
        if (code > 0x1f && code !== 0x7f) {
            return char === "\\" || char === '"' ? `\\${char}` : char;
        }
        const shorthand = TOML_CONTROL_SHORTHANDS[char];
        return shorthand ?? `\\u${code.toString(16).padStart(4, "0")}`;
    }).join("");
    return `"${escaped}"`;
}

const TOML_CONTROL_SHORTHANDS: Record<string, string | undefined> = {
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
    "\b": "\\b",
    "\f": "\\f"
};

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
    const manifest = await readGeneratedCrateManifest(outputDir, typesCrateName);
    const patched = addTypesCrateToLock(contents, typesCrateName, manifest, skipCliDep, packageName);
    await writeFile(lockPath, patched);
}

/**
 * Pure transformation for unit-test access.
 *
 * The stanza is derived from `manifest` — the crate's real `Cargo.toml` — rather
 * than hardcoded. The generated crates' dependency sets vary by spec (one API's
 * types crate pulls `chrono`, another's pulls `base64`), and a stanza that does
 * not mirror the manifest exactly makes Cargo reject the lock under `--locked`.
 */
export function addTypesCrateToLock(
    cargoLock: string,
    typesCrateName: string,
    manifest: GeneratedCrateManifest,
    skipCliDep?: boolean,
    packageName: string = TEMPLATE_PACKAGE_NAME
): string {
    const snakeName = typesCrateName.replace(/-/g, "_");

    // 1. Append the [[package]] entry for the types crate. Cargo accepts any
    //    order, so appending is fine.
    const packageEntry = generatedCrateLockStanza(
        snakeName,
        manifest.version,
        renderLockDependencyList(cargoLock, manifest.dependencies, [snakeName])
    );

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
    const manifest = await readGeneratedCrateManifest(outputDir, sdkCrateName);
    const patched = addSdkCrateToLock(contents, sdkCrateName, typesCrateName, manifest, packageName);
    await writeFile(lockPath, patched);
}

/**
 * Pure transformation for unit-test access. As with
 * {@link addTypesCrateToLock}, the stanza mirrors the crate's real
 * `Cargo.toml` — its version and full dependency set — because anything less
 * makes Cargo reject the lock under `--locked`.
 */
export function addSdkCrateToLock(
    cargoLock: string,
    sdkCrateName: string,
    typesCrateName: string,
    manifest: GeneratedCrateManifest,
    packageName: string = TEMPLATE_PACKAGE_NAME
): string {
    const sdkSnakeName = sdkCrateName.replace(/-/g, "_");
    const typesSnakeName = typesCrateName.replace(/-/g, "_");

    // 1. Append the [[package]] entry for the SDK crate. The types crate is a
    //    sibling resolved in this same pass, so it is exempt from the
    //    present-in-lock check.
    const packageEntry = generatedCrateLockStanza(
        sdkSnakeName,
        manifest.version,
        renderLockDependencyList(cargoLock, manifest.dependencies, [sdkSnakeName, typesSnakeName])
    );

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

/** A generated crate's identity, read from the `Cargo.toml` it ships with. */
export interface GeneratedCrateManifest {
    /** `[package] version`. */
    version: string;
    /** `[dependencies]` entries. Dev-dependencies are excluded: Cargo does not
     *  record them for a path dependency that is not a workspace member. */
    dependencies: Array<{ name: string; versionReq: string | undefined }>;
}

/**
 * Parse the `[package] version` and `[dependencies]` names out of a generated
 * crate's `Cargo.toml`.
 *
 * Deliberately not a full TOML parse — same convention as the rest of this
 * module (see `requireReplace`). It handles the two shapes the Rust generators
 * emit: inline (`name = "1.0"` / `name = { version = "1.0", … }`) and a
 * `[dependencies.name]` sub-table.
 */
export function parseGeneratedCrateManifest(cargoToml: string): GeneratedCrateManifest {
    let version: string | undefined;
    let section = "";
    const dependencies: Array<{ name: string; versionReq: string | undefined }> = [];

    for (const rawLine of cargoToml.split("\n")) {
        const line = rawLine.trim();
        if (line.startsWith("#") || line.length === 0) {
            continue;
        }
        const header = line.match(/^\[([^\]]+)\]$/);
        if (header?.[1] != null) {
            section = header[1];
            // `[dependencies.foo]` declares `foo` itself.
            const subTable = section.match(/^dependencies\.(.+)$/);
            if (subTable?.[1] != null) {
                dependencies.push({ name: subTable[1], versionReq: undefined });
            }
            continue;
        }
        const assignment = line.match(/^([A-Za-z0-9_-]+)\s*=\s*(.+)$/);
        if (assignment?.[1] == null) {
            continue;
        }
        const [, key, value = ""] = assignment;
        if (section === "package" && key === "version" && version == null) {
            version = value.replace(/^"|"$/g, "");
            continue;
        }
        if (section === "dependencies") {
            // `foo = "1.0"` or `foo = { version = "1.0", features = [...] }`.
            const inlineVersion = value.startsWith("{")
                ? value.match(/version\s*=\s*"([^"]+)"/)?.[1]
                : value.match(/^"([^"]+)"$/)?.[1];
            dependencies.push({ name: key, versionReq: inlineVersion });
        }
        // A `[dependencies.foo]` sub-table's own keys (`path`, `version`, …) are
        // skipped: `section` is `dependencies.foo`, not `dependencies`.
    }

    if (version == null) {
        throw new Error("patchCargoToml: generated crate Cargo.toml has no [package] version");
    }
    return { version, dependencies };
}

/** Every version of `name` present in the lock, in file order. */
function lockPackageVersions(cargoLock: string, name: string): string[] {
    const pattern = new RegExp(`\\[\\[package\\]\\]\\nname = "${escapeRegExp(name)}"\\nversion = "([^"]+)"`, "g");
    return [...cargoLock.matchAll(pattern)].map((m) => m[1] ?? "").filter((v) => v.length > 0);
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** The leading major component of a version or requirement (`^1.2` -> `1`). */
function leadingMajor(value: string): string | undefined {
    return value.match(/(\d+)/)?.[1];
}

/**
 * Render a generated crate's dependency list the way Cargo.lock records it:
 * sorted, and version-qualified (`"thiserror 1.0.69"`) for any package the lock
 * holds more than one version of — which happens whenever the CLI SDK and a
 * generated crate pin different majors of the same dependency.
 *
 * Throws when a dependency is absent from the lock. That case used to produce a
 * lock that still *built* but failed `cargo metadata --locked` and `cargo audit`
 * — dependency auditing silently disabled rather than a visible error. Failing
 * generation instead surfaces it at the point it can be fixed: declare the
 * package in the CLI SDK template's own Cargo.toml so the shipped lock covers it.
 */
export function renderLockDependencyList(
    cargoLock: string,
    dependencies: GeneratedCrateManifest["dependencies"],
    /** Names resolved within this generation rather than from the lock (the
     *  sibling generated crates, which are appended as their own stanzas). */
    siblingCrateNames: string[]
): string[] {
    const missing: string[] = [];
    const refs = dependencies.map(({ name, versionReq }) => {
        if (siblingCrateNames.includes(name)) {
            return name;
        }
        const versions = lockPackageVersions(cargoLock, name);
        if (versions.length === 0) {
            missing.push(name);
            return name;
        }
        if (versions.length === 1) {
            return name;
        }
        const wantedMajor = versionReq != null ? leadingMajor(versionReq) : undefined;
        const matched = wantedMajor != null ? versions.find((v) => leadingMajor(v) === wantedMajor) : undefined;
        return `${name} ${matched ?? versions[versions.length - 1]}`;
    });

    if (missing.length > 0) {
        throw new Error(
            `patchCargoToml: the generated crate depends on ${missing.join(", ")}, which ` +
                "is absent from the shipped Cargo.lock. Declare it in generators/cli/sdk/Cargo.toml " +
                "(an unused `optional = true` entry is enough to pin it) and refresh that lock, " +
                "otherwise the generated project fails `cargo build --locked` and `cargo audit`."
        );
    }
    return [...new Set(refs)].sort((a, b) => a.localeCompare(b));
}

/** Build the `[[package]]` stanza Cargo.lock expects for a generated crate. */
function generatedCrateLockStanza(lockName: string, version: string, dependencyRefs: string[]): string {
    const lines = ["", "[[package]]", `name = "${lockName}"`, `version = "${version}"`];
    if (dependencyRefs.length > 0) {
        lines.push("dependencies = [");
        for (const ref of dependencyRefs) {
            lines.push(` "${ref}",`);
        }
        lines.push("]");
    }
    lines.push("");
    return lines.join("\n");
}

/** Read a generated crate's `Cargo.toml` from the output tree. */
async function readGeneratedCrateManifest(outputDir: string, crateDirName: string): Promise<GeneratedCrateManifest> {
    const manifestPath = path.join(outputDir, crateDirName, "Cargo.toml");
    return parseGeneratedCrateManifest(await readFile(manifestPath, "utf-8"));
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
