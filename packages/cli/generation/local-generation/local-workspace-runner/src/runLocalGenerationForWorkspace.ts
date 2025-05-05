import chalk from "chalk";
import os from "os";
import path from "path";
import tmp from "tmp-promise";

import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
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
    context
}: {
    token: FernToken | undefined;
    projectConfig: fernConfigJson.ProjectConfig;
    workspace: AbstractAPIWorkspace<unknown>;
    generatorGroup: generatorsYml.GeneratorGroup;
    keepDocker: boolean;
    context: TaskContext;
}): Promise<void> {
    const workspaceTempDir = await getWorkspaceTempDir();

    const results = await Promise.all(
        generatorGroup.generators.map(async (generatorInvocation) => {
            return context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const fernWorkspace = await workspace.toFernWorkspace(
                    { context },
                    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                );

                let organization;
                let intermediateRepresentation;

                if (generatorInvocation.absolutePathToLocalOutput == null) {
                    if (token == null || token.type === "user") {
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
                }

                const absolutePathToLocalOutput =
                    generatorInvocation.absolutePathToLocalOutput ?? AbsoluteFilePath.of(workspaceTempDir.path);

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
                    ir: intermediateRepresentation
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
