import type { SdkConfigIrV1 } from "@postman/sdk-config";

/** CLI generation settings that fern-cli-generator reads from `config` under the same key. */
const CLI_GENERATION_KEYS = [
    "binaryName",
    "customCommands",
    "rootGroup",
    "profiles",
    "splitTypeCrates",
    "userAgentSuffixFlag"
] as const;

export const CLI_GENERATION_PATHS = [
    "generation.language.cli.binaryName",
    "generation.language.cli.customCommands",
    "generation.language.cli.rootGroup",
    "generation.language.cli.profiles.enabled",
    "generation.language.cli.profiles.commandName",
    "generation.language.cli.profiles.revokeOperation",
    "generation.language.cli.profiles.provisionOperation.operation",
    "generation.language.cli.profiles.provisionOperation.credential.*",
    "generation.language.cli.profiles.provisionOperation.revokeParameters.*",
    "generation.language.cli.splitTypeCrates",
    "generation.language.cli.userAgentSuffixFlag"
] as const;

export const DISTRIBUTION_PATHS = [
    "output.distribution.githubApp.appIdSecretName",
    "output.distribution.githubApp.privateKeySecretName",
    "output.distribution.homebrew.tap",
    "output.distribution.homebrew.formula",
    "output.distribution.homebrew.tokenSecretName",
    "output.distribution.scoop.bucket",
    "output.distribution.scoop.tokenSecretName",
    "output.distribution.githubAttestations"
] as const;

type CliDistribution = NonNullable<Extract<SdkConfigIrV1["output"], { delivery: "github" }>["distribution"]>;

/** The typed CLI generation settings, copied verbatim; omitted settings keep the generator's defaults. */
export function cliGenerationConfig(ir: SdkConfigIrV1): Record<string, unknown> {
    const cli = ir.generation.language?.cli;
    if (cli == null) {
        return {};
    }
    return Object.fromEntries(
        CLI_GENERATION_KEYS.filter((key) => cli[key] !== undefined).map((key) => [key, structuredClone(cli[key])])
    );
}

/**
 * `output.distribution` back to the generator's `config.distribution` keys. Secret names are written
 * as-is and generator defaults stay unwritten, so a channel without its own token still uses
 * `githubApp`.
 */
export function distributionConfig(output: SdkConfigIrV1["output"]): Record<string, unknown> | undefined {
    if (output.delivery !== "github" || output.distribution == null) {
        return undefined;
    }
    const { githubApp, homebrew, scoop, githubAttestations }: CliDistribution = output.distribution;
    return {
        ...(githubApp != null
            ? {
                  githubApp: {
                      appIdSecret: githubApp.appIdSecretName,
                      privateKeySecret: githubApp.privateKeySecretName
                  }
              }
            : {}),
        ...(homebrew != null
            ? {
                  homebrew: {
                      tap: homebrew.tap,
                      ...(homebrew.formula != null ? { formula: homebrew.formula } : {}),
                      ...(homebrew.tokenSecretName != null
                          ? { tokenEnvironmentVariable: homebrew.tokenSecretName }
                          : {})
                  }
              }
            : {}),
        ...(scoop != null
            ? {
                  scoop: {
                      bucket: scoop.bucket,
                      ...(scoop.tokenSecretName != null ? { tokenEnvironmentVariable: scoop.tokenSecretName } : {})
                  }
              }
            : {}),
        ...(githubAttestations != null ? { githubAttestations } : {})
    };
}
