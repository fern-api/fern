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
 * Use this to validate version strings that will flow into shell commands
 * (e.g. `AutoVersioningService.replaceMagicVersion`, which currently runs
 * `bash -c` with the version embedded in a single-quoted sed expression —
 * any character outside the pattern below would escape shell quoting and
 * enable command injection).
 */
export function isValidSemver(version: string): boolean {
    return SEMVER_PATTERN.test(version);
}

/**
 * Increments a semantic version based on the version bump type.
 *
 * @param currentVersion The current version (e.g., "1.2.3" or "v1.2.3")
 * @param versionBump The type of version bump (MAJOR, MINOR, PATCH)
 * @return The incremented version
 * @throws AutoVersioningException if version parsing fails or unknown bump type
 */
export function incrementVersion(currentVersion: string, versionBump: VersionBump): string {
    const matcher = currentVersion.match(SEMVER_PATTERN);
    if (!matcher) {
        throw new AutoVersioningException("Invalid semantic version format: " + currentVersion);
    }

    const prefix = matcher[1] || "";
    let major = parseInt(matcher[2] ?? "0", 10);
    let minor = parseInt(matcher[3] ?? "0", 10);
    let patch = parseInt(matcher[4] ?? "0", 10);
    const preRelease = matcher[5];
    const buildMetadata = matcher[6];

    let preserveMetadata = false;

    if (versionBump === VersionBump.MAJOR) {
        major++;
        minor = 0;
        patch = 0;
    } else if (versionBump === VersionBump.MINOR) {
        minor++;
        patch = 0;
    } else if (versionBump === VersionBump.PATCH) {
        patch++;
    } else if (versionBump === VersionBump.NO_CHANGE) {
        preserveMetadata = true;
    } else {
        throw new AutoVersioningException("Unknown version bump type: " + versionBump);
    }

    let newVersion = `${prefix}${major}.${minor}.${patch}`;

    if (preserveMetadata) {
        if (preRelease) {
            newVersion += `-${preRelease}`;
        }

        if (buildMetadata) {
            newVersion += `+${buildMetadata}`;
        }
    }

    return newVersion;
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
