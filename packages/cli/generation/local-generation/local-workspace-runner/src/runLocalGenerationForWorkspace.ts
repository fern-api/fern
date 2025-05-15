import chalk from "chalk";
import os from "os";
import path from "path";
import tmp from "tmp-promise";

import { FernToken } from "@fern-api/auth";
import { getAccessToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { ContainerRunner, replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { FernIr } from "@fern-api/ir-sdk";
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
    keepDocker,
    context,
    runner
}: {
    token: FernToken | undefined;
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
    runner: ContainerRunner | undefined;
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

                let organization;
                let intermediateRepresentation;

                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    token = await getAccessToken();
                    if (token == null) {
                        interactiveTaskContext.failWithoutThrowing("Fern token is required.");
                        return;
                    }
                    const venus = createVenusService({ token: token?.value });

                    organization = await venus.organization.get(
                        FernVenusApi.OrganizationId(projectConfig.organization)
                    );
                    if (!organization.ok) {
                        interactiveTaskContext.failWithoutThrowing(
                            `Failed to load details for organization ${projectConfig.organization}.`
                        );
                        return;
                    }

                    intermediateRepresentation = generateIntermediateRepresentation({
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
                        version: undefined,
                        packageName: generatorsYml.getPackageName({ generatorInvocation }),
                        context,
                        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
                    });

                    if (organization.body.selfHostedSdKs) {
                        intermediateRepresentation.selfHosted = true;
                    }

                    // Set the publish config on the intermediateRepresentation if available
                    const publishConfig = getPublishConfig({ generatorInvocation });
                    if (publishConfig != null) {
                        intermediateRepresentation.publishConfig = publishConfig;
                    }
                }

                const absolutePathToLocalOutput =
                    generatorInvocation.absolutePathToLocalOutput ??
                    join(
                        workspace.absoluteFilePath,
                        RelativeFilePath.of("sdks"),
                        RelativeFilePath.of(generatorInvocation.language ?? generatorInvocation.name)
                    );

                await writeFilesToDiskAndRunGenerator({
                    organization: projectConfig.organization,
                    absolutePathToFernConfig: projectConfig._absolutePath,
                    workspace: fernWorkspace,
                    generatorInvocation,
                    absolutePathToLocalOutput,
                    absolutePathToLocalSnippetJSON: undefined,
                    absolutePathToLocalSnippetTemplateJSON: undefined,
                    audiences: generatorGroup.audiences,
                    workspaceTempDir,
                    keepDocker,
                    context: interactiveTaskContext,
                    irVersionOverride: generatorInvocation.irVersionOverride,
                    outputVersionOverride: undefined,
                    writeUnitTests: organization?.body.snippetUnitTestsEnabled ?? false,
                    generateOauthClients: organization?.body.oauthClientEnabled ?? false,
                    generatePaginatedClients: organization?.body.paginationEnabled ?? false,
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

export async function getWorkspaceTempDir(): Promise<tmp.DirectoryResult> {
    return tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern"
    });
}

function getPublishConfig({
    generatorInvocation
}: {
    generatorInvocation: generatorsYml.GeneratorInvocation;
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
