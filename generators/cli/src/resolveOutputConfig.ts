import type { GeneratorConfig } from "@fern-api/base-generator";
import { assertNeverNoThrow } from "@fern-api/core-utils";

/**
 * Resolved output configuration the CLI pipeline consumes.
 *
 * `version` follows the Rust SDK's `getCrateVersion()` precedence:
 *   1. `customConfig` version override (future — not wired yet)
 *   2. `config.output.mode` version (github / publish modes)
 *   3. default "0.0.0"
 *
 * `npmPublishInfo` is present only in github output mode when the
 * upstream config includes npm publish metadata. The pipeline uses it
 * to gate workflow emission and stamp the npm package name.
 */
export interface ResolvedOutputConfig {
    version: string;
    /**
     * Non-null only when output mode is `github` and the upstream
     * config includes `publishInfo` of type `npm`. The pipeline
     * emits `.github/workflows/ci.yml` only when this is set.
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

const DEFAULT_VERSION = "0.0.0";

type OutputMode = GeneratorConfig["output"]["mode"];

/**
 * Visit `config.output.mode` to extract version + npm publish info.
 *
 * Mirrors the Rust SDK's `getCrateVersion()` pattern: the resolved
 * version comes from the mode union (`github.version`,
 * `publish.version`), falling back to a default when no version is
 * supplied (e.g. `downloadFiles` / `local_files` mode).
 */
export function resolveOutputConfig(output: GeneratorConfig["output"]): ResolvedOutputConfig {
    const mode: OutputMode = output.mode;
    switch (mode.type) {
        case "github": {
            return {
                version: mode.version,
                npmPublishInfo: resolveNpmPublishInfo(mode.publishInfo)
            };
        }
        case "publish":
            return {
                version: mode.version,
                npmPublishInfo: undefined
            };
        case "downloadFiles":
            return {
                version: DEFAULT_VERSION,
                npmPublishInfo: undefined
            };
        default:
            // Forward-compatible: unknown output modes fall back to default version with no npm publishing.
            assertNeverNoThrow(mode as never);
            return {
                version: DEFAULT_VERSION,
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
