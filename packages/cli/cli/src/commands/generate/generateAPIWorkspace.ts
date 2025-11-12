import { FernToken } from "@fern-api/auth";
import {
    DEFAULT_GROUP_GENERATORS_CONFIG_KEY,
    fernConfigJson,
    GENERATORS_CONFIGURATION_FILENAME,
    generatorsYml
} from "@fern-api/configuration-loader";
import { ContainerRunner } from "@fern-api/core-utils";
import { AbsoluteFilePath, cwd, join, RelativeFilePath, resolve } from "@fern-api/fs-utils";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { runRemoteGenerationForAPIWorkspace } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { GROUP_CLI_OPTION } from "../../constants";
import { validateAPIWorkspaceAndLogIssues } from "../validate/validateAPIWorkspaceAndLogIssues";
import { GenerationMode } from "./generateAPIWorkspaces";

export async function generateWorkspace({
    organization,
    workspace,
    projectConfig,
    context,
    groupName,
    version,
    shouldLogS3Url,
    token,
    useLocalDocker,
    keepDocker,
    absolutePathToPreview,
    mode,
    runner,
    inspect,
    lfsOverride,
    githubMode,
    githubBranch
}: {
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    projectConfig: fernConfigJson.ProjectConfig;
    context: TaskContext;
    version: string | undefined;
    groupName: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken | undefined;
    useLocalDocker: boolean;
    keepDocker: boolean;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    mode: GenerationMode | undefined;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    lfsOverride: string | undefined;
    githubMode: string | undefined;
    githubBranch: string | undefined;
}): Promise<void> {
    if (workspace.generatorsConfiguration == null) {
        context.logger.warn("This workspaces has no generators.yml");
        return;
    }

    if (workspace.generatorsConfiguration.groups.length === 0) {
        context.logger.warn(`This workspace has no groups specified in ${GENERATORS_CONFIGURATION_FILENAME}`);
        return;
    }

    const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration.defaultGroup;
    if (groupNameOrDefault == null) {
        return context.failAndThrow(
            `No group specified. Use the --${GROUP_CLI_OPTION} option, or set "${DEFAULT_GROUP_GENERATORS_CONFIG_KEY}" in ${GENERATORS_CONFIGURATION_FILENAME}`
        );
    }

    let group = workspace.generatorsConfiguration.groups.find(
        (otherGroup) => otherGroup.groupName === groupNameOrDefault
    );
    if (group == null) {
        return context.failAndThrow(`Group '${groupNameOrDefault}' does not exist.`);
    }

    // Apply lfs-override if specified
    if (lfsOverride != null) {
        group = applyLfsOverride(group, lfsOverride, context);
    }

    // Apply github overrides if specified
    if (githubMode != null || githubBranch != null) {
        group = applyGithubOverrides(group, githubMode, githubBranch, context);
    }

    await validateAPIWorkspaceAndLogIssues({
        workspace: await workspace.toFernWorkspace({ context }),
        context,
        logWarnings: false
    });

    if (useLocalDocker) {
        await runLocalGenerationForWorkspace({
            token,
            projectConfig,
            workspace,
            generatorGroup: group,
            version,
            keepDocker,
            context,
            runner,
            inspect
        });
    } else {
        if (!token) {
            return context.failAndThrow("Please run fern login");
        }
        await runRemoteGenerationForAPIWorkspace({
            projectConfig,
            organization,
            workspace,
            context,
            generatorGroup: group,
            version,
            shouldLogS3Url,
            token,
            whitelabel: workspace.generatorsConfiguration.whitelabel,
            absolutePathToPreview,
            mode
        });
    }
}

function applyLfsOverride(
    group: generatorsYml.GeneratorGroup,
    lfsOverridePath: string,
    context: TaskContext
): generatorsYml.GeneratorGroup {
    const baseAbsolutePath = AbsoluteFilePath.of(resolve(cwd(), lfsOverridePath));

    // Count generators and track languages for duplicate handling
    const languageCount: Record<string, number> = {};
    const modifiedGenerators: generatorsYml.GeneratorInvocation[] = [];

    for (const generator of group.generators) {
        const language = generator.language ?? getLanguageFromGeneratorName(generator.name);

        let outputPath: AbsoluteFilePath;

        if (group.generators.length === 1) {
            // Single generator: use the provided path directly
            outputPath = baseAbsolutePath;
        } else {
            // Multiple generators: create subdirectories
            const languageDir = language || "unknown";

            if (languageCount[languageDir] == null) {
                languageCount[languageDir] = 0;
            }
            languageCount[languageDir]++;

            const dirName =
                languageCount[languageDir] === 1 ? languageDir : `${languageDir}-${languageCount[languageDir]}`;

            outputPath = join(baseAbsolutePath, RelativeFilePath.of(dirName));
        }

        // Create a new generator with local-file-system output mode
        const modifiedGenerator: generatorsYml.GeneratorInvocation = {
            ...generator,
            outputMode: FernFiddle.remoteGen.OutputMode.downloadFiles({}),
            absolutePathToLocalOutput: outputPath
        };

        modifiedGenerators.push(modifiedGenerator);

        context.logger.info(
            `Overriding output for generator '${generator.name}' to local-file-system at: ${outputPath}`
        );
    }

    return {
        ...group,
        generators: modifiedGenerators
    };
}

function applyGithubOverrides(
    group: generatorsYml.GeneratorGroup,
    githubMode: string | undefined,
    githubBranch: string | undefined,
    context: TaskContext
): generatorsYml.GeneratorGroup {
    const modifiedGenerators: generatorsYml.GeneratorInvocation[] = [];
    let hasGithubGenerator = false;

    for (const generator of group.generators) {
        // Check if this generator uses github output mode
        if (generator.outputMode.type === "githubV2") {
            hasGithubGenerator = true;

            const currentOutputMode = generator.outputMode;
            const currentGithubConfig = currentOutputMode.githubV2;

            // Create a new github output mode with overridden values
            const newGithubConfig = FernFiddle.GithubOutputModeV2._visit(currentGithubConfig, {
                push: (pushConfig) => {
                    const newMode = githubMode ?? "push";
                    switch (newMode) {
                        case "push":
                            return FernFiddle.GithubOutputModeV2.push({
                                owner: pushConfig.owner,
                                repo: pushConfig.repo,
                                branch: githubBranch ?? pushConfig.branch,
                                license: pushConfig.license,
                                publishInfo: pushConfig.publishInfo,
                                downloadSnippets: pushConfig.downloadSnippets
                            });
                        case "pull-request":
                            return FernFiddle.GithubOutputModeV2.pullRequest({
                                owner: pushConfig.owner,
                                repo: pushConfig.repo,
                                license: pushConfig.license,
                                publishInfo: pushConfig.publishInfo,
                                downloadSnippets: pushConfig.downloadSnippets,
                                reviewers: undefined
                            });
                        case "commit":
                        case "release":
                            return FernFiddle.GithubOutputModeV2.commitAndRelease({
                                owner: pushConfig.owner,
                                repo: pushConfig.repo,
                                license: pushConfig.license,
                                publishInfo: pushConfig.publishInfo,
                                downloadSnippets: pushConfig.downloadSnippets
                            });
                        default:
                            return currentGithubConfig;
                    }
                },
                pullRequest: (prConfig) => {
                    const newMode = githubMode ?? "pull-request";

                    if (githubBranch != null && newMode !== "push") {
                        return context.failAndThrow(
                            `--github-branch is only valid with 'push' mode. Generator '${generator.name}' is currently '${newMode}'. Pass --github-mode push to use --github-branch.`
                        );
                    }

                    switch (newMode) {
                        case "push":
                            return FernFiddle.GithubOutputModeV2.push({
                                owner: prConfig.owner,
                                repo: prConfig.repo,
                                branch: githubBranch,
                                license: prConfig.license,
                                publishInfo: prConfig.publishInfo,
                                downloadSnippets: prConfig.downloadSnippets
                            });
                        case "pull-request":
                            return FernFiddle.GithubOutputModeV2.pullRequest({
                                owner: prConfig.owner,
                                repo: prConfig.repo,
                                license: prConfig.license,
                                publishInfo: prConfig.publishInfo,
                                downloadSnippets: prConfig.downloadSnippets,
                                reviewers: prConfig.reviewers
                            });
                        case "commit":
                        case "release":
                            return FernFiddle.GithubOutputModeV2.commitAndRelease({
                                owner: prConfig.owner,
                                repo: prConfig.repo,
                                license: prConfig.license,
                                publishInfo: prConfig.publishInfo,
                                downloadSnippets: prConfig.downloadSnippets
                            });
                        default:
                            return currentGithubConfig;
                    }
                },
                commitAndRelease: (commitConfig) => {
                    const newMode = githubMode ?? "commit";

                    if (githubBranch != null && newMode !== "push") {
                        return context.failAndThrow(
                            `--github-branch is only valid with 'push' mode. Generator '${generator.name}' is currently '${newMode}'. Pass --github-mode push to use --github-branch.`
                        );
                    }

                    switch (newMode) {
                        case "push":
                            return FernFiddle.GithubOutputModeV2.push({
                                owner: commitConfig.owner,
                                repo: commitConfig.repo,
                                branch: githubBranch,
                                license: commitConfig.license,
                                publishInfo: commitConfig.publishInfo,
                                downloadSnippets: commitConfig.downloadSnippets
                            });
                        case "pull-request":
                            return FernFiddle.GithubOutputModeV2.pullRequest({
                                owner: commitConfig.owner,
                                repo: commitConfig.repo,
                                license: commitConfig.license,
                                publishInfo: commitConfig.publishInfo,
                                downloadSnippets: commitConfig.downloadSnippets,
                                reviewers: undefined
                            });
                        case "commit":
                        case "release":
                            return FernFiddle.GithubOutputModeV2.commitAndRelease({
                                owner: commitConfig.owner,
                                repo: commitConfig.repo,
                                license: commitConfig.license,
                                publishInfo: commitConfig.publishInfo,
                                downloadSnippets: commitConfig.downloadSnippets
                            });
                        default:
                            return currentGithubConfig;
                    }
                },
                _other: () => currentGithubConfig
            });

            const newOutputMode = FernFiddle.OutputMode.githubV2(newGithubConfig);

            const modifiedGenerator: generatorsYml.GeneratorInvocation = {
                ...generator,
                outputMode: newOutputMode
            };

            modifiedGenerators.push(modifiedGenerator);

            const overrideMessages: string[] = [];
            if (githubMode != null) {
                overrideMessages.push(`mode=${githubMode}`);
            }
            if (githubBranch != null) {
                overrideMessages.push(`branch=${githubBranch}`);
            }
            if (overrideMessages.length > 0) {
                context.logger.info(
                    `Overriding github config for generator '${generator.name}': ${overrideMessages.join(", ")}`
                );
            }
        } else {
            // Keep the generator as-is if it doesn't use github output mode
            modifiedGenerators.push(generator);
        }
    }

    if (!hasGithubGenerator && (githubMode != null || githubBranch != null)) {
        context.logger.warn(
            "GitHub override flags were specified, but no generators in this group use GitHub output mode"
        );
    }

    return {
        ...group,
        generators: modifiedGenerators
    };
}

function getLanguageFromGeneratorName(generatorName: string): string {
    // Try to extract language from common generator naming patterns
    if (generatorName.includes("typescript") || generatorName.includes("ts")) {
        return "typescript";
    }
    if (generatorName.includes("python") || generatorName.includes("py")) {
        return "python";
    }
    if (generatorName.includes("java")) {
        return "java";
    }
    if (generatorName.includes("go")) {
        return "go";
    }
    if (generatorName.includes("ruby")) {
        return "ruby";
    }
    if (generatorName.includes("csharp") || generatorName.includes("c#")) {
        return "csharp";
    }
    if (generatorName.includes("swift")) {
        return "swift";
    }
    if (generatorName.includes("php")) {
        return "php";
    }
    if (generatorName.includes("rust")) {
        return "rust";
    }
    // If we can't determine the language, use the generator name itself
    return generatorName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
}
