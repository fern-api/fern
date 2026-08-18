import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { FernCliHomebrewConfig } from "./customConfig.js";

/**
 * Strip Fern-specific identifiers from the shipped `dist-workspace.toml`.
 *
 * The SDK template's file pins `npm-scope = "@fern-api"` and
 * `npm-package = "cli-sdk"` — values used by cargo-dist when generating
 * its npm installer artifact. If the customer runs `cargo dist plan`
 * without editing these, the published installer would target Fern's
 * npm namespace, which is wrong. We delete both lines so the customer
 * either fills in their own values or accepts cargo-dist's defaults
 * (no npm installer).
 *
 * We also drop the `cargo:crates/pipeline-fixture` workspace member that
 * the template inherits verbatim from cli-sdk's own `dist-workspace.toml`.
 * `pipeline-fixture` is a cli-sdk-only release-pipeline smoke-test crate; it
 * is never vendored into generated CLIs, so leaving the member in place makes
 * `cargo metadata` / `cargo dist plan` fail to load a nonexistent manifest.
 *
 * Everything else in the file — `targets`, `installers`, `ci`,
 * `archive` formats — is generic boilerplate worth keeping.
 *
 * No-op when the file doesn't exist (e.g. if a future change removes
 * the dist-workspace.toml from the SDK template entirely).
 */
export async function patchDistWorkspaceToml(args: {
    outputDir: string;
    typesCrateName?: string;
    sdkCrateName?: string;
    /**
     * Per-API type crates behind the types facade, when partitioning is on, as
     * paths relative to the workspace root (e.g. `types/<crate>`). cargo-dist
     * members are paths, not package names, and these crates are nested a level
     * below the facade.
     */
    typePartitionMemberPaths?: string[];
    /**
     * When set, cargo-dist's native Homebrew installer + publish job are
     * turned on. Only meaningful on the first (crate-name-free) call —
     * the member-adding call below reads the already-patched file back
     * off disk, so the keys written here survive it.
     */
    homebrew?: FernCliHomebrewConfig;
    /** Formula name fallback when `homebrew.formula` is unset. */
    binaryName?: string;
}): Promise<void> {
    const { outputDir, typesCrateName, sdkCrateName, typePartitionMemberPaths = [], homebrew, binaryName } = args;
    const distTomlPath = path.join(outputDir, "dist-workspace.toml");
    let contents: string;
    try {
        contents = await readFile(distTomlPath, "utf-8");
    } catch {
        return;
    }

    if (typesCrateName != null || sdkCrateName != null) {
        let patched = contents;
        if (typesCrateName != null) {
            patched = addWorkspaceMember(patched, typesCrateName);
        }
        for (const memberPath of typePartitionMemberPaths) {
            patched = addWorkspaceMember(patched, memberPath);
        }
        if (sdkCrateName != null) {
            patched = addWorkspaceMember(patched, sdkCrateName);
        }
        await writeFile(distTomlPath, patched);
        return;
    }

    let patched = applyDistWorkspacePatch(contents);
    if (homebrew != null) {
        patched = applyHomebrewPatch(patched, homebrew, binaryName);
    }
    if (patched === contents) {
        return;
    }
    await writeFile(distTomlPath, patched);
}

/**
 * Turn on cargo-dist's Homebrew support. Purely additive: `installers`
 * gains `"homebrew"`, `publish-jobs` gains `"homebrew"`, and the `tap` /
 * `formula` keys cargo-dist reads at plan time are set under `[dist]`.
 *
 * Exported for unit-test access.
 */
export function applyHomebrewPatch(
    distToml: string,
    homebrew: FernCliHomebrewConfig,
    binaryName: string | undefined
): string {
    let result = addToStringArray(distToml, "installers", "homebrew");
    result = addToStringArray(result, "publish-jobs", "homebrew");
    result = setDistKey(result, "tap", homebrew.tap);
    const formula = homebrew.formula ?? binaryName;
    if (formula != null) {
        result = setDistKey(result, "formula", formula);
    }
    return result;
}

/**
 * Append a quoted entry to a top-level TOML array (`installers`,
 * `publish-jobs`), preserving the existing entries and their order.
 * No-op when the entry is already present or the key is absent — the
 * inverse of `stripNpmInstaller`, sharing its regex-over-one-line shape.
 */
export function addToStringArray(distToml: string, key: string, value: string): string {
    const pattern = new RegExp(`^(${escapeRegExp(key)}\\s*=\\s*\\[)([^\\]]*)\\]`, "m");
    return distToml.replace(pattern, (match, prefix: string, inner: string) => {
        const items = inner
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
        if (items.includes(`"${value}"`)) {
            return match;
        }
        return `${prefix}${[...items, `"${value}"`].join(", ")}]`;
    });
}

/**
 * Set a scalar string key inside the `[dist]` table. Replaces the value
 * in place when the key already exists, otherwise appends the key at the
 * end of the table (before the next `[section]` header, or at EOF).
 * Appends a `[dist]` table when the file has none.
 */
export function setDistKey(distToml: string, key: string, value: string): string {
    return setDistRawKey(distToml, key, `"${value}"`);
}

/**
 * As `setDistKey`, but writes the value verbatim so non-string TOML
 * (booleans, arrays) can be set too.
 */
export function setDistRawKey(distToml: string, key: string, rawValue: string): string {
    const line = `${key} = ${rawValue}`;
    const existing = new RegExp(`^${escapeRegExp(key)}\\s*=.*$`, "m");
    if (existing.test(distToml)) {
        return distToml.replace(existing, line);
    }
    const distHeader = distToml.match(/^\[dist\]$/m);
    if (distHeader?.index == null) {
        return `${distToml.endsWith("\n") ? distToml : `${distToml}\n`}\n[dist]\n${line}\n`;
    }
    const afterHeader = distHeader.index + distHeader[0].length;
    const nextSection = distToml.slice(afterHeader).search(/^\[[^\]]+\]$/m);
    const insertAt = nextSection === -1 ? distToml.length : afterHeader + nextSection;
    const head = distToml.slice(0, insertAt).replace(/\n*$/, "\n");
    return `${head}${line}\n${nextSection === -1 ? "" : "\n"}${distToml.slice(insertAt)}`;
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Pure transformation, exported for unit-test access. Removes the two
 * Fern-branded lines (and their preceding `#` comments, when those
 * comments would otherwise dangle without context), and strips `"npm"`
 * from the `installers` array so cargo-dist only produces shell +
 * powershell installers. Leaves the file unchanged when no anchors
 * match and installers doesn't contain npm.
 */
export function applyDistWorkspacePatch(distToml: string): string {
    let result = distToml.replace(NPM_SCOPE_BLOCK, "").replace(NPM_PACKAGE_BLOCK, "");
    result = stripNpmInstaller(result);
    result = removeWorkspaceMember(result, PIPELINE_FIXTURE_MEMBER);
    result = applyRustlsPatch(result);
    return result;
}

/**
 * Build every cargo-dist artifact against rustls instead of the crate's
 * default `native-tls`.
 *
 * Two concrete defects this fixes, both observed on a real release:
 *
 *  1. **musl never built at all.** `native-tls` pulls `openssl-sys`,
 *     whose build script needs a musl-linked OpenSSL that no GitHub
 *     runner has. Both musl targets died in ~44s with "Could not find
 *     directory of OpenSSL installation". Because `host` only runs when
 *     `build-local-artifacts` succeeded or skipped, a *failed* matrix
 *     leg meant no GitHub Release was created — so the whole
 *     cargo-dist path (archives, shell installer, Homebrew formula)
 *     produced nothing.
 *
 *  2. **The glibc binaries that did build are not portable.** The
 *     released `x86_64-unknown-linux-gnu` executable carries
 *     `NEEDED libssl.so.3` / `libcrypto.so.3`, so it fails to start on
 *     any distro still on OpenSSL 1.1 — Ubuntu 20.04, Debian 11,
 *     RHEL 8, Amazon Linux 2. That is the exact artifact `brew install`
 *     hands to Linux users, so it would fail at their terminal rather
 *     than in our CI.
 *
 * `rustls-tls-native-roots` still reads the OS trust store, so
 * corporate/MITM root CAs keep working; what goes away is the dynamic
 * dependency on the host's OpenSSL. This mirrors what the npm publish
 * job in `ci.yml` already does for its musl builds
 * (`--no-default-features --features rustls`).
 *
 * Applied to every github-output generation rather than only when a
 * distribution channel is enabled: the broken musl leg and the
 * OpenSSL-3 dependency are properties of the cargo-dist release
 * pipeline itself, which is emitted unconditionally.
 */
export function applyRustlsPatch(distToml: string): string {
    // No `[dist]` table means this file drives no cargo-dist build, so
    // there is nothing to correct — and synthesising one would turn a
    // file with no release config into a file that has some.
    if (!/^\[dist\]$/m.test(distToml)) {
        return distToml;
    }
    let result = setDistRawKey(distToml, "default-features", "false");
    result = setDistRawKey(result, "features", '["rustls"]');
    return result;
}

/**
 * Remove a workspace member entry from the `members = [...]` array under
 * `[workspace]`, leaving the rest of the list intact. No-op when the
 * `[workspace]` section, the `members` array, or the member is absent.
 */
export function removeWorkspaceMember(distToml: string, member: string): string {
    return distToml.replace(
        /(\[workspace\]\s*\nmembers\s*=\s*\[)([^\]]*)\]/,
        (_match, prefix: string, inner: string) => {
            const items = inner
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && s !== `"${member}"`);
            return `${prefix}${items.join(", ")}]`;
        }
    );
}

/**
 * Defensively removes `"npm"` from the `installers = [...]` line in
 * dist-workspace.toml. This ensures that even if an older or manually
 * edited template still lists npm, the generated output won't include
 * it — npm publishing is handled by the separate ci.yml pipeline.
 */
export function stripNpmInstaller(distToml: string): string {
    return distToml.replace(/^(installers\s*=\s*\[)([^\]]*)\]/m, (_match, prefix: string, inner: string) => {
        const items = inner
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s !== '"npm"');
        return `${prefix}${items.join(", ")}]`;
    });
}

/**
 * Add a types crate as a workspace member. Inserts a `members` array
 * entry under `[workspace]` if the section exists, or appends a new
 * `[workspace]` section.
 */
export function addWorkspaceMember(distToml: string, typesCrateName: string): string {
    const memberLine = `"cargo:${typesCrateName}"`;
    // Look for existing [workspace] with members = [...]
    const workspaceMatch = distToml.match(/(\[workspace\]\s*\nmembers\s*=\s*\[)([^\]]*)\]/);
    if (workspaceMatch != null) {
        const existing = workspaceMatch[2]?.trim() ?? "";
        const newMembers = existing.length > 0 ? `${existing}, ${memberLine}` : memberLine;
        return distToml.replace(workspaceMatch[0], `${workspaceMatch[1]}${newMembers}]`);
    }
    // Look for [workspace] without members
    const wsIdx = distToml.indexOf("[workspace]");
    if (wsIdx !== -1) {
        const insertPos = wsIdx + "[workspace]".length;
        return distToml.slice(0, insertPos) + `\nmembers = [${memberLine}]` + distToml.slice(insertPos);
    }
    // No [workspace] section — append one
    return distToml + `\n[workspace]\nmembers = [${memberLine}]\n`;
}

/**
 * cli-sdk-only release-pipeline smoke-test crate. It lives in cli-sdk's
 * workspace but is never vendored into generated CLIs, so its `members`
 * entry must be stripped from the shipped `dist-workspace.toml`.
 */
const PIPELINE_FIXTURE_MEMBER = "cargo:crates/pipeline-fixture";

const NPM_SCOPE_BLOCK = `# A namespace to use when publishing this package to the npm registry
npm-scope = "@fern-api"
`;

const NPM_PACKAGE_BLOCK = `# The npm package should have this name
npm-package = "cli-sdk"
`;
