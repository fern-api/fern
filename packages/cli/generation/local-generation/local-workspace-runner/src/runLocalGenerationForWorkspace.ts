import { FernToken, getAccessToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { ContainerRunner, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath, join, RelativeFilePath, validateOutputPath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr, PublishTarget } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";
import chalk from "chalk";
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
    runner
}: {
    token: FernToken | undefined;
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    keepDocker: boolean;
    context: TaskContext;
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
                    version: version,
                    packageName: generatorsYml.getPackageName({ generatorInvocation }),
                    context,
                    sourceResolver: new SourceResolverImpl(context, fernWorkspace)
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
                    if (organization.body.selfHostedSdKs) {
                        intermediateRepresentation.selfHosted = true;
                    }
                    if (organization.body.isWhitelabled) {
                        if (intermediateRepresentation.readmeConfig == null) {
                            intermediateRepresentation.readmeConfig = emptyReadmeConfig;
                        }
                        intermediateRepresentation.readmeConfig.whiteLabel = true;
                    }
                }

                // Set the publish config on the intermediateRepresentation if available

                // grabs generator.yml > config > package_name
                const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);

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

                const absolutePathToLocalOutput =
                    generatorInvocation.absolutePathToLocalOutput ??
                    join(
                        workspace.absoluteFilePath,
                        RelativeFilePath.of("sdks"),
                        RelativeFilePath.of(generatorInvocation.language ?? generatorInvocation.name)
                    );

                const validationResult = validateOutputPath(absolutePathToLocalOutput);
                if (!validationResult.isValid) {
                    interactiveTaskContext.failAndThrow(
                        `Cannot write to output directory: ${validationResult.reason}\n` +
                            `Attempted path: ${absolutePathToLocalOutput}\n` +
                            `This path is blocked for security reasons to prevent accidental system file deletion.`
                    );
                }

                const absolutePathToLocalSnippetJSON =
                    generatorInvocation.raw?.snippets?.path != null
                        ? AbsoluteFilePath.of(
                              join(
                                  workspace.absoluteFilePath,
                                  RelativeFilePath.of(generatorInvocation.raw.snippets.path)
                              )
                          )
                        : undefined;

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
                    outputVersionOverride: undefined,
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
            });
        })
    );

    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }
}

function getPackageNameFromGeneratorConfig(generatorInvocation: GeneratorInvocation): string | undefined {
    return typeof generatorInvocation.raw?.config === "object" && generatorInvocation.raw?.config !== null
        ? (generatorInvocation.raw.config as { package_name?: string }).package_name
        : undefined;
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
