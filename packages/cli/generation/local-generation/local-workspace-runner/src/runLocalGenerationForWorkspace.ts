import {
    checkVersionDoesNotAlreadyExist,
    computeSemanticVersion,
    detectCiProvider,
    detectInvocationSource,
    getOriginGitCommit,
    getOriginGitCommitIsDirty,
    getPackageNameFromGeneratorConfig
} from "@fern-api/api-workspace-commons";
import { validateAPIWorkspaceAndLogIssues } from "@fern-api/api-workspace-validator";
import { FernToken, getAccessToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { ContainerRunner, extractErrorMessage, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import { AutoVersioningCache, isAutoVersion } from "@fern-api/generator-cli/autoversion";
import { logReplaySummary, type PipelineLogger, PostGenerationPipeline } from "@fern-api/generator-cli/pipeline";
import { cloneRepository, parseRepository } from "@fern-api/github";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr, PublishTarget } from "@fern-api/ir-sdk";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { getDynamicGeneratorConfig } from "@fern-api/remote-workspace-runner";
import { CliError, TaskAbortSignal, TaskContext } from "@fern-api/task-context";
import type { FernVenusApi } from "@fern-api/venus-api-sdk";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";
import chalk from "chalk";
import * as fs from "fs/promises";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { getGeneratorOutputSubfolder } from "./getGeneratorOutputSubfolder.js";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator.js";

export async function runLocalGenerationForWorkspace({
    token,
    projectConfig,
    workspace,
    generatorGroup,
    version,
    keepDocker,
    inspect,
    context,
    absolutePathToPreview,
    runner,
    ai,
    replay,
    noReplay,
    validateWorkspace,
    requireEnvVars,
    skipFernignore,
    publishToRegistry,
    isPreview: isPreviewOverride,
    automationMode,
    autoMerge,
    skipIfNoDiff,
    disableTelemetry
}: {
    token: FernToken | undefined;
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    keepDocker: boolean;
    context: TaskContext;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    runner: ContainerRunner | undefined;
    inspect: boolean;
    ai: generatorsYml.AiServicesSchema | undefined;
    replay?: generatorsYml.ReplayConfigSchema | undefined;
    noReplay?: boolean;
    validateWorkspace?: boolean;
    requireEnvVars?: boolean;
    skipFernignore?: boolean;
    publishToRegistry?: boolean;
    isPreview?: boolean;
    automationMode?: boolean;
    autoMerge?: boolean;
    skipIfNoDiff?: boolean;
    disableTelemetry?: boolean;
}): Promise<void> {
    // Fail fast: check all generators for version conflicts BEFORE starting any IR generation.
    // This avoids wasted work when one generator would fail the version check.
    const userProvidedVersion = version;
    if (userProvidedVersion != null) {
        if (absolutePathToPreview != null) {
            context.logger.warn(
                "Skipping version availability check in preview mode. " +
                    `Version ${userProvidedVersion} may already exist on the package registry.`
            );
        } else {
            for (const generatorInvocation of generatorGroup.generators) {
                const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);
                await checkVersionDoesNotAlreadyExist({
                    version: userProvidedVersion,
                    packageName,
                    generatorInvocation,
                    context
                });
            }
        }
    }

    const autoVersioningCache = new AutoVersioningCache();
    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const isPreview = isPreviewOverride ?? absolutePathToPreview != null;
                const substituteEnvVars = <T>(stringOrObject: T) =>
                    replaceEnvVariables(
                        stringOrObject,
                        {
                            onError: (e) => {
                                if (!isPreview && (requireEnvVars ?? true)) {
                                    interactiveTaskContext.failAndThrow(e, undefined, {
                                        code: CliError.Code.EnvironmentError
                                    });
                                }
                            }
                        },
                        { substituteAsEmpty: isPreview }
                    );

                generatorInvocation = substituteEnvVars(generatorInvocation);

                const fernWorkspace = await workspace.toFernWorkspace(
                    { context },
                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation),
                    generatorInvocation.apiOverride?.specs
                );

                if (validateWorkspace) {
                    await validateAPIWorkspaceAndLogIssues({
                        workspace: fernWorkspace,
                        context,
                        logWarnings: false,
                        ossWorkspace: workspace instanceof OSSWorkspace ? workspace : undefined
                    });
                }

                const dynamicGeneratorConfig = getDynamicGeneratorConfig({
                    apiName: fernWorkspace.definition.rootApiFile.contents.name,
                    organization: projectConfig.organization,
                    generatorInvocation: generatorInvocation
                });

                const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);
                version = version ?? (await computeSemanticVersion({ packageName, generatorInvocation }));

                const intermediateRepresentation = generateIntermediateRepresentation({
                    workspace: fernWorkspace,
                    audiences: generatorGroup.audiences,
                    generationLanguage: generatorInvocation.language,
                    keywords: generatorInvocation.keywords,
                    smartCasing: generatorInvocation.smartCasing,
                    exampleGeneration: {
                        includeOptionalRequestPropertyExamples: false,
                        disabled: generatorInvocation.disableExamples
                    },
                    readme: generatorInvocation.readme,
                    version: version ?? (await computeSemanticVersion({ packageName, generatorInvocation })),
                    packageName,
                    context,
                    sourceResolver: new SourceResolverImpl(context, fernWorkspace),
                    dynamicGeneratorConfig,
                    generationMetadata: {
                        cliVersion: workspace.cliVersion,
                        generatorName: generatorInvocation.name,
                        generatorVersion: generatorInvocation.version,
                        generatorConfig: generatorInvocation.config,
                        originGitCommit: getOriginGitCommit(),
                        originGitCommitIsDirty: getOriginGitCommitIsDirty(),
                        invokedBy: detectInvocationSource(),
                        requestedVersion: userProvidedVersion,
                        ciProvider: detectCiProvider()
                    }
                });

                const venus = createVenusService({ token: token?.value });

                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    token ??= await getAccessToken();
                    if (token == null) {
                        interactiveTaskContext.failWithoutThrowing(
                            "Please provide a FERN_TOKEN in your environment.",
                            undefined,
                            { code: CliError.Code.AuthError }
                        );
                        return;
                    }
                }

                const organization = await venus.organization.get(projectConfig.organization);

                if (generatorInvocation.absolutePathToLocalOutput == null && !organization.ok) {
                    interactiveTaskContext.failWithoutThrowing(
                        `Failed to load details for organization ${projectConfig.organization}.`,
                        undefined,
                        { code: CliError.Code.NetworkError }
                    );
                    return;
                }

                if (organization.ok) {
                    if (organization.body.isWhitelabled) {
                        if (intermediateRepresentation.readmeConfig == null) {
                            intermediateRepresentation.readmeConfig = emptyReadmeConfig;
                        }
                        intermediateRepresentation.readmeConfig.whiteLabel = true;
                    }
                    intermediateRepresentation.selfHosted = organization.body.selfHostedSdKs;
                }

                // Set the publish config on the intermediateRepresentation if available
                const publishConfig = getPublishConfig({
                    generatorInvocation,
                    org: organization.ok ? organization.body : undefined,
                    version,
                    userProvidedVersion,
                    packageName,
                    context: interactiveTaskContext
                });
                if (publishConfig != null) {
                    intermediateRepresentation.publishConfig = publishConfig;
                }

                const absolutePathToPreviewForGenerator = resolveAbsolutePathToLocalPreview(
                    absolutePathToPreview,
                    generatorInvocation
                );

                const absolutePathToLocalOutput =
                    absolutePathToPreviewForGenerator ??
                    generatorInvocation.absolutePathToLocalOutput ??
                    AbsoluteFilePath.of(await tmp.dir().then((dir) => dir.path));

                const selfhostedGithubConfig = getSelfhostedGithubConfig(
                    generatorInvocation,
                    absolutePathToPreviewForGenerator != null
                );

                // Validate that automatic versioning requires self-hosted GitHub configuration
                if (version != null && isAutoVersion(version)) {
                    if (selfhostedGithubConfig == null) {
                        context.failAndThrow(
                            `Automatic versioning (--version AUTO) requires a self-hosted GitHub repository configuration. ` +
                                `Regular GitHub repositories are not supported because auto versioning needs to push changes back to the repository. ` +
                                `Please configure your generator with self-hosted GitHub output in generators.yml. ` +
                                `Example:\n` +
                                `generators:\n` +
                                `  - name: fernapi/fern-typescript-sdk\n` +
                                `    version: latest\n` +
                                `    github:\n` +
                                `      uri: your-org/your-sdk-repo\n` +
                                `      token: \${GITHUB_TOKEN}\n` +
                                `      mode: pull-request\n`,
                            undefined,
                            { code: CliError.Code.ConfigError }
                        );
                    }
                }

                if (selfhostedGithubConfig != null) {
                    await fs.rm(absolutePathToLocalOutput, { recursive: true, force: true });
                    await fs.mkdir(absolutePathToLocalOutput, { recursive: true });

                    // Log git environment info for debugging
                    interactiveTaskContext.logger.debug(
                        `Self-hosted GitHub mode: cloning ${selfhostedGithubConfig.uri} to ${absolutePathToLocalOutput}`
                    );
                    try {
                        const { execSync } = await import("child_process");
                        const gitPath = execSync("which git 2>/dev/null || echo 'not found'", {
                            encoding: "utf-8"
                        }).trim();
                        const gitVersion = execSync("git --version 2>/dev/null || echo 'unknown'", {
                            encoding: "utf-8"
                        }).trim();
                        interactiveTaskContext.logger.debug(
                            `Git environment: path=${gitPath}, version=${gitVersion}, PATH=${process.env.PATH ?? "unset"}`
                        );
                    } catch {
                        interactiveTaskContext.logger.debug(
                            `Git environment: unable to determine git info, PATH=${process.env.PATH ?? "unset"}`
                        );
                    }

                    try {
                        const repo = await cloneRepository({
                            githubRepository: selfhostedGithubConfig.uri,
                            installationToken: selfhostedGithubConfig.token,
                            targetDirectory: absolutePathToLocalOutput,
                            timeoutMs: 30000 // 30 seconds timeout for credential/network issues
                        });

                        // For push mode and pull-request mode with a target branch,
                        // checkout the target branch while the working tree is clean.
                        // This prevents non-fast-forward errors that occur when trying to checkout
                        // after files have been generated (dirty working tree).
                        const mode = selfhostedGithubConfig.mode ?? "push";
                        if ((mode === "push" || mode === "pull-request") && selfhostedGithubConfig.branch != null) {
                            interactiveTaskContext.logger.debug(
                                `Checking out branch ${selfhostedGithubConfig.branch} before generation`
                            );
                            // For pull-request mode, the branch must exist on remote
                            // (to match remote generation behavior)
                            if (mode === "pull-request") {
                                const branchExists = await repo.remoteBranchExists(selfhostedGithubConfig.branch);
                                if (!branchExists) {
                                    const parsedRepo = parseRepository(selfhostedGithubConfig.uri);
                                    interactiveTaskContext.failAndThrow(
                                        `Branch ${selfhostedGithubConfig.branch} does not exist in repository ${parsedRepo.owner}/${parsedRepo.repo}`,
                                        undefined,
                                        { code: CliError.Code.ConfigError }
                                    );
                                }
                            }
                            await repo.checkoutRemoteBranch(selfhostedGithubConfig.branch);
                        }
                    } catch (error) {
                        interactiveTaskContext.failAndThrow(
                            `Failed to clone GitHub repository ${selfhostedGithubConfig.uri}: ${extractErrorMessage(error)}`,
                            undefined,
                            { code: CliError.Code.NetworkError }
                        );
                    }
                }

                let absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined = undefined;
                if (generatorInvocation.raw?.snippets?.path != null) {
                    absolutePathToLocalSnippetJSON = AbsoluteFilePath.of(
                        join(workspace.absoluteFilePath, RelativeFilePath.of(generatorInvocation.raw.snippets.path))
                    );
                }
                if (absolutePathToLocalSnippetJSON == null && selfhostedGithubConfig != null) {
                    absolutePathToLocalSnippetJSON = AbsoluteFilePath.of(
                        (await getWorkspaceTempDir()).path + "/snippet.json"
                    );
                }

                // NOTE(tjb9dc): Important that we get a new temp dir per-generator, as we don't want their local files to collide.
                const workspaceTempDir = await getWorkspaceTempDir();

                const {
                    shouldCommit,
                    autoVersioningCommitMessage,
                    autoVersioningChangelogEntry,
                    autoVersioningPrDescription,
                    autoVersioningVersionBumpReason,
                    autoVersioningVersionBump,
                    autoVersioningNewVersion,
                    autoVersioningPreviousVersion
                } = await writeFilesToDiskAndRunGenerator({
                    organization: projectConfig.organization,
                    absolutePathToFernConfig:
                        workspace.generatorsConfiguration?.absolutePathToConfiguration ?? projectConfig._absolutePath,
                    workspace: fernWorkspace,
                    generatorInvocation,
                    absolutePathToLocalOutput,
                    absolutePathToLocalSnippetJSON,
                    absolutePathToLocalSnippetTemplateJSON: undefined,
                    version,
                    audiences: generatorGroup.audiences,
                    workspaceTempDir,
                    keepDocker,
                    context: interactiveTaskContext,
                    irVersionOverride: generatorInvocation.irVersionOverride,
                    outputVersionOverride: version,
                    writeUnitTests: true,
                    generateOauthClients: organization.ok ? (organization?.body.oauthClientEnabled ?? false) : false,
                    generatePaginatedClients: organization.ok ? (organization?.body.paginationEnabled ?? false) : false,
                    includeOptionalRequestPropertyExamples: false,
                    inspect,
                    executionEnvironment: undefined, // This should use the Docker fallback with proper image name
                    ir: intermediateRepresentation,
                    whiteLabel: organization.ok ? organization.body.isWhitelabled : false,
                    publishToRegistry,
                    runner,
                    ai,
                    autoVersioningCache,
                    absolutePathToSpecRepo: dirname(workspace.absoluteFilePath),
                    skipFernignore,
                    disableTelemetry
                });

                interactiveTaskContext.logger.info(chalk.green("Wrote files to " + absolutePathToLocalOutput));

                // Run post-generation pipeline (replay + GitHub) when outputting to a self-hosted GitHub repo
                if (selfhostedGithubConfig != null && shouldCommit) {
                    const pipelineLogger: PipelineLogger = {
                        debug: (msg) => interactiveTaskContext.logger.debug(msg),
                        info: (msg) => interactiveTaskContext.logger.info(msg),
                        warn: (msg) => interactiveTaskContext.logger.warn(msg),
                        error: (msg) => interactiveTaskContext.logger.error(msg)
                    };

                    const hasBreakingChanges = autoVersioningVersionBump === "MAJOR";

                    const pipeline = new PostGenerationPipeline(
                        {
                            outputDir: absolutePathToLocalOutput,
                            replay: { enabled: replay?.enabled === true, skipApplication: noReplay, stageOnly: false },
                            github: {
                                enabled: true,
                                uri: selfhostedGithubConfig.uri,
                                token: selfhostedGithubConfig.token,
                                mode: selfhostedGithubConfig.mode ?? "push",
                                branch: selfhostedGithubConfig.branch,
                                commitMessage: autoVersioningCommitMessage,
                                changelogEntry: autoVersioningChangelogEntry,
                                prDescription: autoVersioningPrDescription,
                                versionBumpReason: autoVersioningVersionBumpReason,
                                previousVersion: autoVersioningPreviousVersion,
                                newVersion: autoVersioningNewVersion,
                                versionBump: autoVersioningVersionBump,
                                previewMode: selfhostedGithubConfig.previewMode,
                                generatorName: generatorInvocation.name,
                                automationMode,
                                autoMerge,
                                skipIfNoDiff,
                                hasBreakingChanges,
                                breakingChangesSummary: hasBreakingChanges ? autoVersioningPrDescription : undefined,
                                runId: process.env.FERN_RUN_ID
                            },
                            cliVersion: workspace.cliVersion ?? "unknown",
                            generatorVersions: {
                                [generatorInvocation.name]: generatorInvocation.version
                            },
                            generatorName: generatorInvocation.name
                        },
                        pipelineLogger
                    );

                    const pipelineResult = await pipeline.run();

                    // Log replay summary
                    if (pipelineResult.steps.replay != null) {
                        logReplaySummary(pipelineResult.steps.replay, {
                            debug: (msg) => interactiveTaskContext.logger.debug(msg),
                            info: (msg) => interactiveTaskContext.logger.info(chalk.cyan(msg)),
                            warn: (msg) => interactiveTaskContext.logger.warn(chalk.yellow(msg)),
                            error: (msg) => interactiveTaskContext.logger.error(chalk.red(msg))
                        });
                    }

                    if (pipelineResult.steps.github?.skippedNoDiff) {
                        interactiveTaskContext.logger.info(chalk.green("No changes detected — skipping PR creation"));
                    }

                    if (pipelineResult.steps.github?.autoMergeEnabled) {
                        interactiveTaskContext.logger.info(chalk.green("Automerge enabled on PR"));
                    }

                    if (!pipelineResult.success) {
                        interactiveTaskContext.failAndThrow(
                            `Post-generation pipeline failed: ${pipelineResult.errors?.join(", ")}`,
                            undefined,
                            { code: CliError.Code.UserError }
                        );
                    }
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        throw new TaskAbortSignal();
    }
}

function resolveAbsolutePathToLocalPreview(
    absolutePathToPreview: AbsoluteFilePath | undefined,
    generatorInvocation: generatorsYml.GeneratorInvocation
): AbsoluteFilePath | undefined {
    if (absolutePathToPreview == null) {
        return undefined;
    }
    const subfolderName = getGeneratorOutputSubfolder(generatorInvocation.name);
    return join(absolutePathToPreview, RelativeFilePath.of(subfolderName));
}

export async function getWorkspaceTempDir(): Promise<tmp.DirectoryResult> {
    return tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern"
    });
}

function getPublishConfig({
    generatorInvocation,
    org,
    version,
    userProvidedVersion,
    packageName,
    context
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    org?: FernVenusApi.Organization;
    version?: string;
    userProvidedVersion?: string;
    packageName?: string;
    context: TaskContext;
}): FernIr.PublishingConfig | undefined {
    if (generatorInvocation.raw?.github != null && isGithubSelfhosted(generatorInvocation.raw.github)) {
        const parsed = parseRepository(generatorInvocation.raw.github.uri);

        const irMode = generatorInvocation.raw.github.mode === "pull-request" ? "pull-request" : undefined;

        return FernIr.PublishingConfig.github({
            owner: parsed.owner,
            repo: parsed.repo,
            uri: generatorInvocation.raw.github.uri,
            token: generatorInvocation.raw.github.token,
            mode: irMode,
            branch: generatorInvocation.raw.github.branch,
            target: getPublishTarget({ outputSchema: generatorInvocation.raw.output, version, packageName })
        });
    }

    if (generatorInvocation.raw?.output?.location === "local-file-system") {
        let publishTarget: PublishTarget | undefined = undefined;
        if (generatorInvocation.language === "python") {
            publishTarget = PublishTarget.pypi({
                version,
                packageName
            });
            context.logger.debug(`Created PyPiPublishTarget: version ${version} package name: ${packageName}`);
        } else if (generatorInvocation.language === "typescript") {
            // Only populate the npm publish target when the user explicitly passed
            // `--version`. We intentionally do NOT thread auto-computed versions or
            // package names on their own — doing so would cause unrelated behavior
            // changes (e.g. auto-bumping a version from the npm registry) for users
            // who rely on managing `package.json` themselves.
            if (userProvidedVersion != null) {
                const tsPackageName =
                    packageName ??
                    (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null
                        ? (generatorInvocation.raw.config as { packageJson?: { name?: string } }).packageJson?.name
                        : undefined);
                publishTarget = PublishTarget.npm({
                    version: userProvidedVersion,
                    packageName: tsPackageName,
                    tokenEnvironmentVariable: ""
                });
                context.logger.debug(
                    `Created NpmPublishTarget: version ${userProvidedVersion} package name: ${tsPackageName}`
                );
            }
        } else if (generatorInvocation.language === "rust") {
            // Use Crates publish target for Rust (Cargo/crates.io)
            publishTarget = PublishTarget.crates({
                version,
                packageName
            });
            context.logger.debug(`Created CratesPublishTarget: version ${version} package name: ${packageName}`);
        } else if (generatorInvocation.language === "go") {
            // Only populate the go publish target when the user explicitly passed
            // `--version`. We intentionally do NOT thread auto-computed versions
            // here — Go SDKs do not ship a version file managed by the generator
            // (module versions are set via git tags), so the only reason to
            // populate this is when the user asked us to stamp the SDK with a
            // specific version (e.g. for the `X-Fern-SDK-Version` header).
            if (userProvidedVersion != null) {
                const goModulePath = (() => {
                    const config = generatorInvocation.raw?.config;
                    if (typeof config !== "object" || config === null) {
                        return undefined;
                    }
                    const module = (config as { module?: { path?: unknown } }).module;
                    if (module == null || typeof module.path !== "string") {
                        return undefined;
                    }
                    return module.path;
                })();
                publishTarget = PublishTarget.go({
                    version: userProvidedVersion,
                    modulePath: goModulePath
                });
                context.logger.debug(
                    `Created GoPublishTarget: version ${userProvidedVersion} module path: ${goModulePath}`
                );
            }
        } else if (generatorInvocation.language === "java") {
            const config = generatorInvocation.raw?.config;

            interface JavaGeneratorConfig {
                group?: unknown;
                artifact?: unknown;
                "package-prefix"?: unknown;
                [key: string]: unknown;
            }

            // Support both styles: package-prefix/package_name and group/artifact
            const mavenCoordinate = (() => {
                if (!config || typeof config !== "object" || config === null) {
                    return undefined;
                }

                const configObj = config as JavaGeneratorConfig;

                if (typeof configObj.group === "string" && typeof configObj.artifact === "string") {
                    return {
                        groupId: configObj.group,
                        artifactId: configObj.artifact
                    };
                } else if (typeof configObj["package-prefix"] === "string" && packageName) {
                    return {
                        groupId: configObj["package-prefix"],
                        artifactId: packageName
                    };
                } else if (typeof configObj["package-prefix"] === "string" && !packageName) {
                    context.logger.warn("Java generator has package-prefix configured but packageName is missing");
                }

                return undefined;
            })();

            const coordinate = mavenCoordinate ? `${mavenCoordinate.groupId}:${mavenCoordinate.artifactId}` : undefined;

            if (coordinate) {
                const mavenVersion = version ?? "0.0.0";
                publishTarget = PublishTarget.maven({
                    coordinate,
                    version: mavenVersion,
                    usernameEnvironmentVariable: "MAVEN_USERNAME",
                    passwordEnvironmentVariable: "MAVEN_PASSWORD",
                    mavenUrlEnvironmentVariable: "MAVEN_PUBLISH_REGISTRY_URL"
                });
                context.logger.debug(`Created MavenPublishTarget: coordinate ${coordinate} version ${mavenVersion}`);
            } else if (config && typeof config === "object") {
                context.logger.debug(
                    "Java generator config provided but could not construct Maven coordinate. " +
                        "Expected either 'group' and 'artifact' or 'package-prefix' with packageName."
                );
            }
        }

        return FernIr.PublishingConfig.filesystem({
            generateFullProject: org?.selfHostedSdKs ?? false,
            publishTarget
        });
    }

    return generatorInvocation.outputMode._visit({
        downloadFiles: () => {
            return FernIr.PublishingConfig.filesystem({
                generateFullProject: org?.selfHostedSdKs ?? false,
                publishTarget: undefined
            });
        },
        github: () => undefined,
        githubV2: () => undefined,
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });
}

function getPublishTarget({
    outputSchema,
    version,
    packageName
}: {
    outputSchema: generatorsYml.GeneratorOutputSchema | undefined;
    version?: string;
    packageName?: string;
}): PublishTarget {
    const defaultPublishTarget = FernIr.PublishTarget.postman({
        apiKey: "",
        workspaceId: "",
        collectionId: undefined
    });

    if (outputSchema == null) {
        return defaultPublishTarget;
    }
    if (outputSchema.location === "npm") {
        const token = (outputSchema.token || "${NPM_TOKEN}").trim();
        const useOidc = token === "<USE_OIDC>" || token === "OIDC";
        return PublishTarget.npm({
            packageName: outputSchema["package-name"],
            version: version ?? "0.0.0",
            tokenEnvironmentVariable: useOidc
                ? "<USE_OIDC>"
                : token.startsWith("${") && token.endsWith("}")
                  ? token.slice(2, -1).trim()
                  : ""
        });
    } else if (outputSchema.location === "maven") {
        return PublishTarget.maven({
            version: version ?? "0.0.0",
            coordinate: outputSchema.coordinate,
            usernameEnvironmentVariable: outputSchema.username || "MAVEN_USERNAME",
            passwordEnvironmentVariable: outputSchema.password || "MAVEN_PASSWORD",
            mavenUrlEnvironmentVariable: outputSchema.url || "MAVEN_PUBLISH_REGISTRY_URL"
        });
    } else if (outputSchema.location === "pypi") {
        return PublishTarget.pypi({
            version,
            packageName
        });
    } else {
        return defaultPublishTarget;
    }
}

/**
 * Type guard to check if a GitHub configuration is a self-hosted configuration
 */
function isGithubSelfhosted(
    github: generatorsYml.GithubConfigurationSchema | undefined
): github is generatorsYml.GithubSelfhostedSchema {
    if (github == null) {
        return false;
    }
    return "uri" in github && "token" in github;
}

const emptyReadmeConfig: FernIr.ReadmeConfig = {
    defaultEndpoint: undefined,
    bannerLink: undefined,
    introduction: undefined,
    apiReferenceLink: undefined,
    apiName: undefined,
    disabledFeatures: undefined,
    whiteLabel: undefined,
    customSections: undefined,
    features: undefined,
    exampleStyle: undefined
};

interface SelhostedGithubConfig extends generatorsYml.GithubSelfhostedSchema {
    previewMode: boolean;
}

function getSelfhostedGithubConfig(
    generatorInvocation: generatorsYml.GeneratorInvocation,
    previewMode: boolean
): SelhostedGithubConfig | undefined {
    if (generatorInvocation.raw?.github != null && isGithubSelfhosted(generatorInvocation.raw.github)) {
        return {
            ...generatorInvocation.raw.github,
            previewMode
        };
    }
    return undefined;
}
