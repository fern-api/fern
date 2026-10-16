import { FERN_GENERATOR_LATEST_VERSION } from "@fern-api/remote-workspace-runner";
import semver from "semver";

import type { CliTargetDiagnostic } from "./types.js";

/**
 * First fern-cli-generator version that reads `distribution.githubAttestations` (fern-api/fern#18300). Older
 * versions ignore the key and always attest build provenance, which fails on most private repositories.
 */
export const GITHUB_ATTESTATIONS_MIN_GENERATOR_VERSION = "0.54.3";

/** Whether the generator version honors `distribution.githubAttestations`; `latest` and unparsable versions count as yes. */
export function supportsGithubAttestations(version: string): boolean {
    return semver.valid(version) == null || semver.gte(version, GITHUB_ATTESTATIONS_MIN_GENERATOR_VERSION);
}

/**
 * The cli target's pinned generator version, or `latest` when sdk-config.yml pins none. `latest` is resolved
 * the way an unpinned generators.yml generator is: sdk-gen-api's version discovery picks the newest version it
 * can run, and Fiddle and `--local` use the newest published version.
 */
export function resolveGeneratorVersion({ pinned }: { pinned: string | undefined }): {
    version: string;
    diagnostics: CliTargetDiagnostic[];
} {
    if (pinned == null) {
        return { version: FERN_GENERATOR_LATEST_VERSION, diagnostics: [] };
    }
    if (semver.valid(pinned) !== pinned) {
        return {
            version: pinned,
            diagnostics: [
                {
                    severity: "error",
                    path: "target.generatorVersion",
                    code: "CLI_TARGET_GENERATOR_VERSION",
                    message: `'${pinned}' is not an exact fern-cli-generator version.`,
                    action: "Use an exact version, or remove target.generatorVersion to use the newest version the generation route can run."
                }
            ]
        };
    }
    return { version: pinned, diagnostics: [] };
}
