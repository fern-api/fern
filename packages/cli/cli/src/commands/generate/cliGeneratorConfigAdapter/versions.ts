import semver from "semver";

import type { CliTargetDiagnostic } from "./types.js";

/**
 * fern-cli-generator version the translation uses when sdk-config.yml pins none (see README.md). It is
 * the newest version with a Fern pool in sdk-gen-api's production index, so it generates on both
 * remote routes. Bump it only together with a round-trip run (roundTrip.expected.json records it).
 */
export const DEFAULT_GENERATOR_VERSION = "0.49.0";

/** Versions with a Fern pool in sdk-gen-api's production index; others fail on that route. */
export const POOLED_GENERATOR_VERSIONS: readonly string[] = ["0.49.0"];

/** The cli target's pinned generator version, or the default. */
export function resolveGeneratorVersion({ pinned }: { pinned: string | undefined }): {
    version: string;
    diagnostics: CliTargetDiagnostic[];
} {
    const version = pinned ?? DEFAULT_GENERATOR_VERSION;
    const path = "target.generatorVersion";
    if (semver.valid(version) !== version) {
        return {
            version,
            diagnostics: [
                {
                    severity: "error",
                    path,
                    code: "CLI_TARGET_GENERATOR_VERSION",
                    message: `'${version}' is not an exact fern-cli-generator version.`,
                    action: `Use an exact version such as ${DEFAULT_GENERATOR_VERSION}; \`latest\` resolves differently on each remote route.`
                }
            ]
        };
    }
    if (!POOLED_GENERATOR_VERSIONS.includes(version)) {
        return {
            version,
            diagnostics: [
                {
                    severity: "warning",
                    path,
                    code: "CLI_TARGET_UNPOOLED_VERSION",
                    message: `fern-cli-generator ${version} has no Fern pool in sdk-gen-api, so FERN_USE_SDK_GEN_API=true generation fails; Fiddle may still generate it.`,
                    action: `Use ${POOLED_GENERATOR_VERSIONS.join(" or ")} for the sdk-gen-api route.`
                }
            ]
        };
    }
    return { version, diagnostics: [] };
}
