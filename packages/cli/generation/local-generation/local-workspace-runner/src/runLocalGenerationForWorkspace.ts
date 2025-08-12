import chalk from "chalk";
import os from "os";
import path from "path";
import tmp from "tmp-promise";

import { FernToken, getAccessToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, GeneratorInvocation, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { ContainerRunner, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr, PublishTarget } from "@fern-api/ir-sdk";
import { TaskContext } from "@fern-api/task-context";
import { FernVenusApi } from "@fern-api/venus-api-sdk";
import {
    AbstractAPIWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";

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
    const workspaceTempDir = await getWorkspaceTempDir();

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

                if (organization.ok && organization.body.selfHostedSdKs) {
                    intermediateRepresentation.selfHosted = true;
                }

                // Set the publish config on the intermediateRepresentation if available

                // grabs generator.yml > config > package_name
                const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);

                const publishConfig = getPublishConfig({
                    generatorInvocation,
                    org: organization.ok ? organization.body : undefined,
                    version,
                    packageName,
                    context
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

                const absolutePathToLocalSnippetJSON =
                    generatorInvocation.raw?.snippets?.path != null
                        ? AbsoluteFilePath.of(
                              join(
                                  workspace.absoluteFilePath,
                                  RelativeFilePath.of(generatorInvocation.raw.snippets.path)
                              )
                          )
                        : undefined;

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
        return FernIr.PublishingConfig.github({
            owner: "",
            repo: "",
            uri: generatorInvocation.raw.github.uri,
            token: generatorInvocation.raw.github.token,
            target: FernIr.PublishTarget.postman({
                apiKey: "",
                workspaceId: "",
                collectionId: undefined
            })
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
        }

        return FernIr.PublishingConfig.filesystem({
            generateFullProject: org?.selfHostedSdKs ?? false,
            publishTarget
        });
    }

    return generatorInvocation.outputMode._visit({
        downloadFiles: () => undefined,
        github: () => undefined,
        githubV2: () => undefined,
        publish: () => undefined,
        publishV2: () => undefined,
        _other: () => undefined
    });
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
