#!/usr/bin/env node
import { resolve } from "node:path";
import { computeSemanticVersion } from "@fern-api/api-workspace-commons";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { replaceEnvVariables } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { getGeneratorConfig, getPackageNameFromGeneratorConfig } from "@fern-api/local-workspace-runner";
import { getDynamicGeneratorConfig } from "@fern-api/remote-workspace-runner";
import { SdkGeneratorCLI } from "@fern-api/swift-sdk";
import { createMockTaskContext, TaskContext } from "@fern-api/task-context";
import { getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation } from "@fern-api/workspace-loader";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { initProject } from "./initProject";

yargs(hideBin(process.argv))
    .command(
        "generate",
        "Generate the Swift SDK for the API.",
        (y) =>
            y
                .option("group", {
                    type: "string",
                    description: "The group to generate.",
                    demandOption: true
                })
                .option("outDir", {
                    type: "string",
                    description: "The path to the output directory.",
                    demandOption: true
                })
                .option("version", {
                    type: "string",
                    description: "The version to use for the output.",
                    demandOption: false
                }),
        async (args) => {
            const { group: groupName, outDir, version: versionOverride } = args;
            const cli = new SdkGeneratorCLI();

            const project = await initProject({
                commandLineApiWorkspace: undefined,
                defaultToAllApiWorkspaces: true
            });

            const version: string | undefined = undefined; // TODO: Implement
            const taskContext: TaskContext = createMockTaskContext(); // TODO: Update

            await Promise.all(
                project.apiWorkspaces.map(async (workspace, index) => {
                    if (index > 0) {
                        // TODO: Fix this
                        return;
                    }

                    const findGroup = () => {
                        const groupNameOrDefault = groupName ?? workspace.generatorsConfiguration?.defaultGroup;
                        if (groupNameOrDefault == null) {
                            throw new Error(
                                `No group specified. Use the --group option, or set "default-group" in generators.yml`
                            );
                        }
                        let generatorGroup = workspace.generatorsConfiguration?.groups.find(
                            (otherGroup) => otherGroup.groupName === groupNameOrDefault
                        );
                        if (generatorGroup == null) {
                            throw new Error(`Group '${groupNameOrDefault}' does not exist.`);
                        }
                        return generatorGroup;
                    };

                    const generatorGroup = findGroup();

                    await Promise.all(
                        generatorGroup.generators.map(async (generatorInvocation) => {
                            generatorInvocation = replaceEnvVariables(generatorInvocation, {
                                onError: (e) => {
                                    throw new Error(e);
                                }
                            });

                            const fernWorkspace = await workspace.toFernWorkspace(
                                { context: taskContext },
                                getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation)
                            );

                            const dynamicGeneratorConfig = getDynamicGeneratorConfig({
                                apiName: fernWorkspace.definition.rootApiFile.contents.name,
                                organization: project.config.organization,
                                generatorInvocation: generatorInvocation
                            });

                            const packageName = getPackageNameFromGeneratorConfig(generatorInvocation);

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
                                version:
                                    version ?? (await computeSemanticVersion({ packageName, generatorInvocation })),
                                packageName,
                                context: taskContext,
                                sourceResolver: new SourceResolverImpl(taskContext, fernWorkspace),
                                dynamicGeneratorConfig,
                                generationMetadata: {
                                    cliVersion: workspace.cliVersion,
                                    generatorName: generatorInvocation.name,
                                    generatorVersion: generatorInvocation.version,
                                    generatorConfig: generatorInvocation.config
                                }
                            });

                            const generatorConfig = getGeneratorConfig({
                                generatorInvocation,
                                customConfig: generatorInvocation.config,
                                workspaceName: fernWorkspace.definition.rootApiFile.contents.name,
                                outputVersion: versionOverride,
                                organization: project.config.organization,
                                absolutePathToSnippet: undefined, // TODO: Implement
                                absolutePathToSnippetTemplates: undefined, // TODO: Implement
                                absolutePathToFernConfig: project.config._absolutePath,
                                writeUnitTests: true,
                                generateOauthClients: false, // TODO: Implement
                                generatePaginatedClients: false, // TODO: Implement
                                whiteLabel: false, // TODO: Implement
                                paths: {
                                    snippetPath: undefined, // TODO: Implement
                                    snippetTemplatePath: undefined, // TODO: Implement
                                    irPath: AbsoluteFilePath.of(resolve(process.cwd(), "ir.json")), // TODO: Aim to remove this. It shouldn't be needed.
                                    outputDirectory: AbsoluteFilePath.of(resolve(process.cwd(), outDir))
                                }
                            });

                            await cli.runDirectly(intermediateRepresentation, generatorConfig);
                        })
                    );
                })
            );
        }
    )
    .demandCommand(1)
    .help()
    .parse();
