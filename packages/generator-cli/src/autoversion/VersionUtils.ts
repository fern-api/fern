import semver from "semver";

import { AutoVersioningException } from "./AutoVersioningService.js";

/**
 * Maps a Fern generator name to a normalized language identifier.
 * e.g. "fernapi/fern-typescript-node-sdk" → "typescript"
 */
export function extractLanguageFromGeneratorName(generatorName: string): string {
    const name = generatorName.toLowerCase();
    if (name.includes("typescript") || name.includes("ts-sdk") || name.includes("node-sdk")) {
        return "typescript";
    }
    if (name.includes("python") || name.includes("pydantic") || name.includes("fastapi")) {
        return "python";
    }
    if (name.includes("java") && !name.includes("javascript")) {
        return "java";
    }
    if (/\bgo\b/.test(name)) {
        return "go";
    }
    if (name.includes("ruby")) {
        return "ruby";
    }
    if (name.includes("csharp") || name.includes("dotnet") || name.includes("c-sharp")) {
        return "csharp";
    }
    if (name.includes("php")) {
        return "php";
    }
    if (name.includes("swift")) {
        return "swift";
    }
    if (name.includes("rust")) {
        return "rust";
    }
    if (name.includes("kotlin")) {
        return "kotlin";
    }
    return "unknown";
}

export const AUTO_VERSION = "AUTO";
export const MAGIC_VERSION = "0.0.0-fern-placeholder";

/**
 * PEP 440-compatible magic version for Python generators.
 * Poetry validates versions during generation (poetry lock / poetry install),
 * and PEP 440 does not allow hyphens in pre-release tags. We use "0.0.0.dev0"
 * which is a valid PEP 440 dev release that will never collide with real versions.
 */
export const MAGIC_VERSION_PYTHON = "0.0.0.dev0";

/**
 * Maps the canonical magic version to a language-specific format.
 * - Go: adds "v" prefix ("v0.0.0-fern-placeholder") so semver.Major() returns "v0" (no /vN suffix)
 * - Python: maps to PEP 440 compatible "0.0.0.dev0" (Poetry rejects hyphens in pre-release tags)
 * - Others: returns the canonical magic version as-is
 */
export function mapMagicVersionForLanguage(magicVersion: string, language: string): string {
    if (magicVersion !== MAGIC_VERSION) {
        return magicVersion;
    }
    if (language === "go") {
        return `v${magicVersion}`;
    }
    if (language === "python") {
        return MAGIC_VERSION_PYTHON;
    }
    return magicVersion;
}

/**
 * Maximum byte size for a single AI analysis call.
 * Diffs larger than this are split into chunks (via `chunkDiff`), each analysed
 * separately, with version bumps merged by taking the maximum.
 */
export const MAX_AI_DIFF_BYTES = 40_000;

/**
 * Maximum number of chunks to analyse for a single diff.
 * Chunks are ranked by semantic priority so the first chunks always contain
 * the highest-signal sections (deletions, signature changes). Chunks beyond
 * this limit are skipped — they are typically addition-only (MINOR/PATCH).
 */
export const MAX_CHUNKS = 40;

/**
 * Maximum raw diff size (in bytes) accepted for chunked analysis.
 * Diffs larger than this are rejected before chunking to prevent
 * excessive memory/CPU usage from parsing extremely large inputs
 * (e.g. accidental binary file inclusion). 10 MB.
 */
export const MAX_RAW_DIFF_BYTES = 10_000_000;

export enum VersionBump {
    MAJOR = "MAJOR",
    MINOR = "MINOR",
    PATCH = "PATCH",
    NO_CHANGE = "NO_CHANGE"
}

/**
 * Numeric rank for each VersionBump level.
 * Higher number = more significant change.
 * Used by chunked analysis to pick the maximum bump across chunks.
 */
const VERSION_BUMP_RANK: Record<string, number> = {
    [VersionBump.MAJOR]: 3,
    [VersionBump.MINOR]: 2,
    [VersionBump.PATCH]: 1,
    [VersionBump.NO_CHANGE]: 0
};

/**
 * Returns whichever version bump string is more significant.
 * MAJOR > MINOR > PATCH > NO_CHANGE.
 *
 * Accepts plain strings so callers using the BAML-generated VersionBump enum
 * (from @fern-api/cli-ai) or the local VersionBump enum can both use this.
 */
export function maxVersionBump(a: string, b: string): string {
    return (VERSION_BUMP_RANK[a] ?? 0) >= (VERSION_BUMP_RANK[b] ?? 0) ? a : b;
}

const SEMVER_PATTERN = /^(v)?(\d+)\.(\d+)\.(\d+)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;

/**
 * Checks if the given version string is the AUTO version indicator.
 * This check is case-insensitive, so "AUTO", "auto", "Auto", etc. are all valid.
 */
export function isAutoVersion(version: string): boolean {
    return AUTO_VERSION.toLowerCase() === version.toLowerCase();
}

/**
 * True iff the string is a valid semver as accepted by `incrementVersion`.
 *
 * Use this to validate version strings that will flow into
 * `AutoVersioningService.replaceMagicVersion`.
 */
export function isValidSemver(version: string): boolean {
    return SEMVER_PATTERN.test(version);
}

const PRERELEASE_IDENTIFIER_PATTERN = /^[A-Za-z][0-9A-Za-z-]*$/;

/**
 * True iff the string is usable as a `--prerelease` identifier (e.g. "rc", "beta", "next").
 *
 * Numeric-leading identifiers are rejected: semver treats numeric prerelease segments as
 * counters, so `1.6.0-0.0` would not round-trip through the counter logic below.
 */
export function isValidPrereleaseIdentifier(identifier: string): boolean {
    return PRERELEASE_IDENTIFIER_PATTERN.test(identifier);
}

/**
 * Attaches `-<identifier>.0` to a stable version, preserving any `v` prefix.
 * Versions already on a prerelease line are returned unchanged.
 */
export function applyPrereleaseIdentifier(version: string, identifier: string): string {
    const matcher = version.match(SEMVER_PATTERN);
    if (!matcher) {
        throw new AutoVersioningException("Invalid semantic version format: " + version);
    }
    assertValidPrereleaseIdentifier(identifier);
    if (matcher[5] != null) {
        return version;
    }
    return `${matcher[1] ?? ""}${matcher[2]}.${matcher[3]}.${matcher[4]}-${identifier}.0`;
}

// Pre-release lines stay in line: any real bump advances the prerelease counter.
// Promotion to stable (4.0.0-rc.2 → 4.0.0) requires an explicit baseVersion. See FER-10378.
export function incrementVersion(
    currentVersion: string,
    versionBump: VersionBump,
    options: { prerelease?: string } = {}
): string {
    const matcher = currentVersion.match(SEMVER_PATTERN);
    if (!matcher) {
        throw new AutoVersioningException("Invalid semantic version format: " + currentVersion);
    }

    const prefix = matcher[1] ?? "";
    const versionWithoutPrefix = currentVersion.slice(prefix.length);
    const preRelease = matcher[5];

    if (versionBump === VersionBump.NO_CHANGE) {
        return currentVersion;
    }

    if (options.prerelease != null) {
        return `${prefix}${incrementPrerelease(versionWithoutPrefix, versionBump, options.prerelease)}`;
    }

    let bumped: string | null;
    if (preRelease != null) {
        bumped = semver.inc(versionWithoutPrefix, "prerelease");
    } else if (versionBump === VersionBump.MAJOR) {
        bumped = semver.inc(versionWithoutPrefix, "major");
    } else if (versionBump === VersionBump.MINOR) {
        bumped = semver.inc(versionWithoutPrefix, "minor");
    } else if (versionBump === VersionBump.PATCH) {
        bumped = semver.inc(versionWithoutPrefix, "patch");
    } else {
        throw new AutoVersioningException("Unknown version bump type: " + versionBump);
    }

    if (bumped === null) {
        throw new AutoVersioningException("Failed to increment version: " + currentVersion);
    }

    return `${prefix}${bumped}`;
}

/**
 * Advances a prerelease line for `--prerelease <identifier>`.
 *
 * From a stable version the AI-selected bump is applied to the release core and the counter
 * starts at zero (1.5.5 + MINOR → 1.6.0-rc.0). While that prerelease is pending, further
 * changes fold into it by advancing the counter (1.6.0-rc.0 → 1.6.0-rc.1) — unless the new
 * bump outranks the pending core, in which case the core is re-anchored and the counter
 * resets (1.5.6-rc.1 + MINOR → 1.6.0-rc.0, 1.6.0-rc.2 + MAJOR → 2.0.0-rc.0). Switching
 * identifiers keeps the pending core when that still moves the version forward
 * (1.6.0-beta.3 + `rc` → 1.6.0-rc.0) and otherwise re-anchors the core
 * (1.6.0-rc.3 + `beta` → 1.7.0-beta.0 for MINOR).
 *
 * Every transition is monotonically increasing under semver precedence.
 */
function incrementPrerelease(version: string, versionBump: VersionBump, identifier: string): string {
    assertValidPrereleaseIdentifier(identifier);

    const parsed = semver.parse(version);
    if (parsed == null) {
        throw new AutoVersioningException("Invalid semantic version format: " + version);
    }
    const core = `${parsed.major}.${parsed.minor}.${parsed.patch}`;

    if (parsed.prerelease.length > 0 && !bumpOutranksPendingCore(parsed, versionBump)) {
        if (parsed.prerelease[0] === identifier) {
            const bumped = semver.inc(version, "prerelease", identifier);
            if (bumped == null) {
                throw new AutoVersioningException("Failed to increment version: " + version);
            }
            return bumped;
        }
        // A different identifier can sort below the pending one (rc → beta), so only keep the
        // pending core when the switch still moves the version forward.
        const switched = `${core}-${identifier}.0`;
        if (semver.gt(switched, version)) {
            return switched;
        }
    }

    const bumpedCore = semver.inc(core, toReleaseType(versionBump));
    if (bumpedCore == null) {
        throw new AutoVersioningException("Failed to increment version: " + version);
    }
    return `${bumpedCore}-${identifier}.0`;
}

/**
 * True when the bump is more significant than the one the pending prerelease core already
 * encodes — i.e. a MAJOR while a non-major core (1.6.0, 1.5.6) is pending, or a MINOR while
 * a patch core (1.5.6) is pending. PATCH always folds into the pending core.
 */
function bumpOutranksPendingCore(parsed: semver.SemVer, versionBump: VersionBump): boolean {
    switch (versionBump) {
        case VersionBump.MAJOR:
            return parsed.minor !== 0 || parsed.patch !== 0;
        case VersionBump.MINOR:
            return parsed.patch !== 0;
        case VersionBump.PATCH:
        case VersionBump.NO_CHANGE:
            return false;
        default:
            throw new AutoVersioningException("Unknown version bump type: " + versionBump);
    }
}

function toReleaseType(versionBump: VersionBump): "major" | "minor" | "patch" {
    switch (versionBump) {
        case VersionBump.MAJOR:
            return "major";
        case VersionBump.MINOR:
            return "minor";
        case VersionBump.PATCH:
            return "patch";
        case VersionBump.NO_CHANGE:
        default:
            throw new AutoVersioningException("Unknown version bump type: " + versionBump);
    }
}

function assertValidPrereleaseIdentifier(identifier: string): void {
    if (!isValidPrereleaseIdentifier(identifier)) {
        throw new AutoVersioningException(
            `Invalid prerelease identifier: ${identifier}. Expected an alphanumeric identifier starting with a letter (e.g. "rc").`
        );
    }
}

/**
 * Extracts the previous version from a line containing the magic version.
 * Assumes the line format is like: "version = '0.0.0-fern-placeholder'" or "version: 0.0.0-fern-placeholder"
 *
 * @param lineWithMagicVersion A line from git diff containing the magic version
 * @return The inferred previous version if found, or undefined if the version cannot be parsed
 */
export function extractPreviousVersionFromDiffLine(lineWithMagicVersion: string): string | undefined {
    const prevVersionPattern = /[-].*?([v]?\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?)/;
    const matcher = lineWithMagicVersion.match(prevVersionPattern);

    if (matcher && matcher[1]) {
        const version = matcher[1];
        return version;
    }

    return undefined;
}
