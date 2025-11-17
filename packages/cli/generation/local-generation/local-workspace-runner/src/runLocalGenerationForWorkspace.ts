import { computeSemanticVersion } from "@fern-api/api-workspace-commons";
import { FernToken, getAccessToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { ContainerRunner, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { ClonedRepository, cloneRepository, parseRepository } from "@fern-api/github";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr, PublishTarget } from "@fern-api/ir-sdk";
import { getDynamicGeneratorConfig } from "@fern-api/remote-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import * as fs from "fs/promises";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { writeFilesToDiskAndRunGenerator } from "./runGenerator";

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
    runner
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
}): Promise<void> {
    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const substituteEnvVars = <T>(stringOrObject: T) =>
                    replaceEnvVariables(stringOrObject, { onError: (e) => interactiveTaskContext.failAndThrow(e) });

                generatorInvocation = substituteEnvVars(generatorInvocation);

                const fernWorkspace = await workspace.toFernWorkspace(
                    { context },
                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                );

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
                        generatorConfig: generatorInvocation.config
                    }
                });

                const venus = createVenusService({ token: token?.value });

                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    token = await getAccessToken();
                    if (token == null) {
                        interactiveTaskContext.failWithoutThrowing("Please provide a FERN_TOKEN in your environment.");
                        return;
                    }
                }

                const organization = await venus.organization.get(
                    FernVenusApi.OrganizationId(projectConfig.organization)
                );

                if (generatorInvocation.absolutePathToLocalOutput == null && !organization.ok) {
                    interactiveTaskContext.failWithoutThrowing(
                        `Failed to load details for organization ${projectConfig.organization}.`
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
                }

                // Set the publish config on the intermediateRepresentation if available
                const publishConfig = getPublishConfig({
                    generatorInvocation,
                    org: organization.ok ? organization.body : undefined,
                    version,
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

                if (selfhostedGithubConfig != null) {
                    await fs.rm(absolutePathToLocalOutput, { recursive: true, force: true });
                    await fs.mkdir(absolutePathToLocalOutput, { recursive: true });
                    const repo = await cloneRepository({
                        githubRepository: selfhostedGithubConfig.uri,
                        installationToken: selfhostedGithubConfig.token,
                        targetDirectory: absolutePathToLocalOutput
                    });
                }

                let absolutePathToLocalSnippetJSON: AbsoluteFilePath | undefined = undefined;
                if (generatorInvocation.raw?.snippets?.path != null) {
                    absolutePathToLocalSnippetJSON = AbsoluteFilePath.of(
                        join(workspace.absoluteFilePath, RelativeFilePath.of(generatorInvocation.raw.snippets.path))
                    );
                }
                if (absolutePathToLocalSnippetJSON == null && intermediateRepresentation.selfHosted) {
                    absolutePathToLocalSnippetJSON = AbsoluteFilePath.of(
                        (await getWorkspaceTempDir()).path + "/snippet.json"
                    );
                }

                // NOTE(tjb9dc): Important that we get a new temp dir per-generator, as we don't want their local files to collide.
                const workspaceTempDir = await getWorkspaceTempDir();

                await writeFilesToDiskAndRunGenerator({
                    organization: projectConfig.organization,
                    absolutePathToFernConfig: projectConfig._absolutePath,
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
                    writeUnitTests: organization.ok ? (organization?.body.snippetUnitTestsEnabled ?? false) : false,
                    generateOauthClients: organization.ok ? (organization?.body.oauthClientEnabled ?? false) : false,
                    generatePaginatedClients: organization.ok ? (organization?.body.paginationEnabled ?? false) : false,
                    includeOptionalRequestPropertyExamples: false,
                    inspect,
                    executionEnvironment: undefined, // This should use the Docker fallback with proper image name
                    ir: intermediateRepresentation,
                    runner
                });

                interactiveTaskContext.logger.info(chalk.green("Wrote files to " + absolutePathToLocalOutput));

                if (selfhostedGithubConfig != null) {
                    await postProcessGithubSelfHosted(
                        interactiveTaskContext,
                        selfhostedGithubConfig,
                        absolutePathToLocalOutput
                    );
                }
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

function getPackageNameFromGeneratorConfig(generatorInvocation: GeneratorInvocation): string | undefined {
    // Check output.package-name for npm/PyPI/etc.
    if (typeof generatorInvocation.raw?.output === "object" && generatorInvocation.raw?.output !== null) {
        const packageName = (generatorInvocation.raw.output as { ["package-name"]?: string })["package-name"];
        if (packageName != null) {
            return packageName;
        }
    }

    // Check config.package_name if output.package-name is not set
    if (typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null) {
        const packageName = (generatorInvocation.raw.config as { package_name?: string }).package_name;
        if (packageName != null) {
            return packageName;
        }

        // go-sdk generator uses module.path to set the package name
        const modulePath = (generatorInvocation.raw.config as { module?: { path?: string } }).module?.path;
        if (modulePath != null) {
            return modulePath;
        }
    }
    return undefined;
}
function resolveAbsolutePathToLocalPreview(
    absolutePathToPreview: AbsoluteFilePath | undefined,
    generatorInvocation: GeneratorInvocation
): AbsoluteFilePath | undefined {
    if (absolutePathToPreview == null) {
        return undefined;
    }
    const generatorName = generatorInvocation.name.split("/").pop() ?? "sdk";
    const subfolderName = generatorName.replace(/[^a-zA-Z0-9-_]/g, "_");

    return absolutePathToPreview ? join(absolutePathToPreview, RelativeFilePath.of(subfolderName)) : undefined;
}
async function postProcessGithubSelfHosted(
    context: TaskContext,
    selfhostedGithubConfig: SelhostedGithubConfig,
    absolutePathToLocalOutput: AbsoluteFilePath
): Promise<void> {
    try {
        context.logger.debug("Starting GitHub self-hosted flow...");
        const repository = ClonedRepository.createAtPath(absolutePathToLocalOutput);
        const now = new Date();
        const formattedDate = now.toISOString().replace("T", "_").replace(/:/g, "-").replace(/\..+/, "");
        const prBranch = `fern-bot/${formattedDate}`;
        if (selfhostedGithubConfig.mode === "pull-request") {
            context.logger.debug(`Checking out new branch ${prBranch}`);
            await repository.checkout(prBranch);
        }

        context.logger.debug("Committing changes...");
        await repository.commit("SDK Generation");
        context.logger.debug(`Committed changes to local copy of GitHub repository at ${absolutePathToLocalOutput}`);

        if (!selfhostedGithubConfig.previewMode) {
            await repository.push();
            const pushedBranch = await repository.getCurrentBranch();
            context.logger.info(`Pushed branch: https://github.com/${selfhostedGithubConfig.uri}/tree/${pushedBranch}`);
        }

        if (selfhostedGithubConfig.mode === "pull-request") {
            const baseBranch = await repository.getDefaultBranch();

            const octokit = new Octokit({
                auth: selfhostedGithubConfig.token
            });
            // Use octokit directly to create the pull request
            const parsedRepo = parseRepository(selfhostedGithubConfig.uri);
            const { owner, repo } = parsedRepo;
            const head = `${owner}:${prBranch}`;

            try {
                await octokit.pulls.create({
                    owner,
                    repo,
                    title: "SDK Generation",
                    body: "Automated SDK generation by Fern",
                    head,
                    base: baseBranch,
                    draft: false
                });

                context.logger.info(`Created pull request ${head} -> ${baseBranch} on ${selfhostedGithubConfig.uri}`);
            } catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                if (message.includes("A pull request already exists for")) {
                    context.failWithoutThrowing(`A pull request already exists for ${head}`);
                }
            }
        }
    } catch (error) {
        context.failAndThrow(`Error during GitHub self-hosted flow: ${String(error)}`);
    }
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
    packageName,
    context
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
    org?: FernVenusApi.Organization;
    version?: string;
    packageName?: string;
    context: TaskContext;
}): FernIr.PublishingConfig | undefined {
    if (generatorInvocation.raw?.github != null && isGithubSelfhosted(generatorInvocation.raw.github)) {
        const [owner, repo] = generatorInvocation.raw.github.uri.split("/");
        if (owner == null || repo == null) {
            return context.failAndThrow(
                `Invalid GitHub repository URI: ${generatorInvocation.raw.github.uri}. Expected format: owner/repo`
            );
        }

        return FernIr.PublishingConfig.github({
            owner,
            repo,
            uri: generatorInvocation.raw.github.uri,
            token: generatorInvocation.raw.github.token,
            mode: generatorInvocation.raw.github.mode,
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
        } else if (generatorInvocation.language === "rust") {
            // Use Crates publish target for Rust (Cargo/crates.io)
            publishTarget = PublishTarget.crates({
                version,
                packageName
            });
            context.logger.debug(`Created CratesPublishTarget: version ${version} package name: ${packageName}`);
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
