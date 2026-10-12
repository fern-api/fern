import type { GeneratorConfig } from "@fern-api/base-generator";
import { assertNeverNoThrow } from "@fern-api/core-utils";

/**
 * Resolved output configuration the CLI pipeline consumes.
 *
 * `version` is the version stamped into every generated crate:
 *   1. `config.output.mode` version (github / publish modes)
 *   2. the IR's `generationMetadata.requestedVersion` — the only carrier
 *      for `--version` / SDK Config `sdkVersion` in `downloadFiles` mode
 *      (local-file-system output), whose generator config has no version
 *   3. `undefined`, leaving each crate on its existing default
 *
 * `npmPublishInfo` is present only in github output mode when the
 * upstream config includes npm publish metadata. The pipeline uses it
 * to gate workflow emission and stamp the npm package name.
 */
export interface ResolvedOutputConfig {
    version: string | undefined;
    /**
     * True when the output mode is `github` — the pipeline uses this
     * to decide whether to emit `.github/workflows/ci.yml` at all
     * (build+test jobs are always emitted for GitHub outputs).
     */
    isGithubOutput: boolean;
    /**
     * The full GitHub repository URL (e.g. `https://github.com/fern-api/petstore-cli`).
     * Present only in github output mode. Used to populate `repository.url`
     * in generated npm `package.json` files for provenance verification.
     */
    repoUrl: string | undefined;
    /**
     * Non-null only when output mode is `github` and the upstream
     * config includes `publishInfo` of type `npm`. When set, the
     * emitted `ci.yml` also includes publish + publish-launcher jobs.
     */
    npmPublishInfo: ResolvedNpmPublishInfo | undefined;
}

export interface ResolvedNpmPublishInfo {
    packageName: string;
    registryUrl: string;
    /**
     * The name of the GitHub Actions secret holding the npm auth token.
     * Set to `"<USE_OIDC>"` when OIDC-based publishing is configured.
     */
    tokenEnvironmentVariable: string;
    useOidc: boolean;
}

type OutputMode = GeneratorConfig["output"]["mode"];

/** semver.org's reference pattern — Cargo rejects any `[package] version` outside it. */
const SEMVER_PATTERN =
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

/**
 * The IR's raw `requestedVersion`, if it can be stamped into `Cargo.toml`.
 * `AUTO` and anything else that is not semver are dropped rather than
 * written into a manifest `cargo build` would then reject.
 */
export function resolveRequestedVersion(requestedVersion: string | undefined): string | undefined {
    return requestedVersion != null && SEMVER_PATTERN.test(requestedVersion) ? requestedVersion : undefined;
}

/**
 * Visit `config.output.mode` to extract version + npm publish info.
 *
 * Mirrors the Rust SDK's `getCrateVersion()` pattern: the resolved
 * version comes from the mode union (`github.version`,
 * `publish.version`), then from the IR's `requestedVersion` when the mode
 * carries none (`downloadFiles` / local-file-system output).
 */
export function resolveOutputConfig(
    output: GeneratorConfig["output"],
    requestedVersion?: string
): ResolvedOutputConfig {
    const mode: OutputMode = output.mode;
    switch (mode.type) {
        case "github": {
            return {
                version: mode.version,
                isGithubOutput: true,
                repoUrl: mode.repoUrl,
                npmPublishInfo: resolveNpmPublishInfo(mode.publishInfo)
            };
        }
        case "publish":
            return {
                version: mode.version,
                isGithubOutput: false,
                repoUrl: undefined,
                npmPublishInfo: undefined
            };
        case "downloadFiles":
            return {
                version: resolveRequestedVersion(requestedVersion),
                isGithubOutput: false,
                repoUrl: undefined,
                npmPublishInfo: undefined
            };
        default:
            // Forward-compatible: unknown output modes fall back to the requested version with no npm publishing.
            assertNeverNoThrow(mode as never);
            return {
                version: resolveRequestedVersion(requestedVersion),
                isGithubOutput: false,
                repoUrl: undefined,
                npmPublishInfo: undefined
            };
    }
}

type GithubPublishInfo = NonNullable<Extract<OutputMode, { type: "github" }>["publishInfo"]>;

function resolveNpmPublishInfo(publishInfo: GithubPublishInfo | undefined): ResolvedNpmPublishInfo | undefined {
    if (publishInfo == null) {
        return undefined;
    }
    switch (publishInfo.type) {
        case "npm": {
            if (publishInfo.shouldGeneratePublishWorkflow === false) {
                return undefined;
            }
            const useOidc = publishInfo.tokenEnvironmentVariable === "<USE_OIDC>";
            const tokenEnvironmentVariable =
                useOidc || (publishInfo.tokenEnvironmentVariable != null && publishInfo.tokenEnvironmentVariable !== "")
                    ? publishInfo.tokenEnvironmentVariable
                    : "NPM_TOKEN";
            return {
                packageName: publishInfo.packageName,
                registryUrl: publishInfo.registryUrl,
                tokenEnvironmentVariable,
                useOidc
            };
        }
        default:
            // Non-npm publish types (maven, pypi, nuget, etc.) are intentionally unsupported by the CLI generator.
            assertNeverNoThrow(publishInfo as never);
            return undefined;
    }
}
