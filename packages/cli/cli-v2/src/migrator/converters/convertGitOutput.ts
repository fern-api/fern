import type { schemas } from "@fern-api/config";
import type { generatorsYml } from "@fern-api/configuration";
import type { MigratorWarning } from "../types/index.js";

export interface ConvertGitOutputResult {
    gitOutput?: schemas.GitOutputSchema;
    warnings: MigratorWarning[];
}

/**
 * Converts legacy GitHub configuration to new fern.yml git output format.
 */
export function convertGitOutput(
    githubConfig: generatorsYml.GithubConfigurationSchema | undefined
): ConvertGitOutputResult {
    const warnings: MigratorWarning[] = [];

    if (githubConfig == null) {
        return { warnings };
    }

    // Handle self-hosted mode (uses 'uri' instead of 'repository').
    if (isSelfHostedConfig(githubConfig)) {
        warnings.push({
            type: "unsupported",
            message: "Self-hosted GitHub configuration is not fully supported in fern.yml",
            suggestion: "Use standard git output configuration instead"
        });
        const gitOutput: schemas.GitOutputSchema = {
            repository: githubConfig.uri
        };
        if (githubConfig.branch != null) {
            gitOutput.branch = githubConfig.branch;
        }
        if (githubConfig.license != null) {
            const license = convertLicense(githubConfig.license, warnings);
            if (license != null) {
                gitOutput.license = license;
            }
        }
        return { gitOutput, warnings };
    }

    const gitOutput: schemas.GitOutputSchema = {
        repository: githubConfig.repository
    };

    if ("mode" in githubConfig && githubConfig.mode != null) {
        const mode = githubConfig.mode;
        if (mode === "pull-request") {
            gitOutput.mode = "pr";
        } else if (mode === "push") {
            gitOutput.mode = "push";
        } else if (mode === "commit" || mode === "release") {
            gitOutput.mode = "release";
        }
    } else {
        // GithubCommitAndReleaseSchema without explicit mode defaults to release.
        gitOutput.mode = "release";
    }
    if ("branch" in githubConfig && githubConfig.branch != null) {
        gitOutput.branch = githubConfig.branch;
    }
    if ("license" in githubConfig && githubConfig.license != null) {
        const license = convertLicense(githubConfig.license, warnings);
        if (license != null) {
            gitOutput.license = license;
        }
    }
    if ("reviewers" in githubConfig && githubConfig.reviewers != null) {
        warnings.push({
            type: "unsupported",
            message: "GitHub PR reviewers configuration is not supported in fern.yml",
            suggestion: "Configure reviewers directly in your GitHub repository settings"
        });
    }

    return { gitOutput, warnings };
}

function isSelfHostedConfig(
    config: generatorsYml.GithubConfigurationSchema
): config is generatorsYml.GithubSelfhostedSchema {
    return "uri" in config && "token" in config;
}

function convertLicense(
    license: generatorsYml.GithubLicenseSchema,
    warnings: MigratorWarning[]
): schemas.LicenseSchema | undefined {
    // License in the legacy schema can be:
    // - "MIT" or "Apache-2.0" (well-known licenses)
    // - { custom: string } (custom license content or path)

    if (typeof license === "string") {
        // Standard license types or file paths
        return license;
    }

    // Custom license object - in new schema, we just use the path/content as string
    if (typeof license === "object" && license != null && "custom" in license) {
        warnings.push({
            type: "info",
            message: "Custom license detected - using custom path as license value",
            suggestion: "Ensure the license path points to a valid LICENSE file"
        });
        return license.custom;
    }

    return undefined;
}
