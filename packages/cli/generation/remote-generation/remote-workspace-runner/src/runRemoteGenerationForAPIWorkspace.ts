import { FernToken } from "@fern-api/auth";
import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { fernConfigJson, generatorsYml } from "@fern-api/configuration";
import { createFdrService } from "@fern-api/core";
import { APIV1Write, FdrAPI as CjsFdrSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { convertIrToDynamicSnippetsIr, generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { TaskContext } from "@fern-api/task-context";
import {
    AbstractAPIWorkspace,
    FernWorkspace,
    getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation
} from "@fern-api/workspace-loader";

import { FernFiddle } from "@fern-fern/fiddle-sdk";

import { downloadSnippetsForTask } from "./downloadSnippetsForTask";
import { getDynamicGeneratorConfig } from "./getDynamicGeneratorConfig";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

type DynamicIr = APIV1Write.DynamicIr;
type DynamicIrUpload = APIV1Write.DynamicIrUpload;

export interface RemoteGenerationForAPIWorkspaceResponse {
    snippetsProducedBy: generatorsYml.GeneratorInvocation[];
}

export async function runRemoteGenerationForAPIWorkspace({
    projectConfig,
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
    whitelabel,
    absolutePathToPreview,
    mode
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
    mode: "pull-request" | undefined;
}): Promise<RemoteGenerationForAPIWorkspaceResponse | null> {
    if (generatorGroup.generators.length === 0) {
        context.logger.warn("No generators specified.");
        return null;
    }

    const interactiveTasks: Promise<boolean>[] = [];
    const snippetsProducedBy: generatorsYml.GeneratorInvocation[] = [];

    interactiveTasks.push(
        ...generatorGroup.generators.map((generatorInvocation) =>
            context.runInteractiveTask({ name: generatorInvocation.name }, async (interactiveTaskContext) => {
                const settings = getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(generatorInvocation);

                const fernWorkspace = await workspace.toFernWorkspace({ context }, settings);

                const remoteTaskHandlerResponse = await runRemoteGenerationForGenerator({
                    projectConfig,
                    organization,
                    workspace: fernWorkspace,
                    interactiveTaskContext,
                    generatorInvocation: {
                        ...generatorInvocation,
                        outputMode: generatorInvocation.outputMode._visit<FernFiddle.OutputMode>({
                            downloadFiles: () => generatorInvocation.outputMode,
                            github: (val) => {
                                return FernFiddle.OutputMode.github({
                                    ...val,
                                    makePr: mode === "pull-request"
                                });
                            },
                            githubV2: (val) => {
                                if (mode === "pull-request") {
                                    return FernFiddle.OutputMode.githubV2(
                                        FernFiddle.GithubOutputModeV2.pullRequest(val)
                                    );
                                }
                                return generatorInvocation.outputMode;
                            },
                            publish: () => generatorInvocation.outputMode,
                            publishV2: () => generatorInvocation.outputMode,
                            _other: () => generatorInvocation.outputMode
                        })
                    },
                    version,
                    audiences: generatorGroup.audiences,
                    shouldLogS3Url,
                    token,
                    whitelabel,
                    readme: generatorInvocation.readme,
                    irVersionOverride: generatorInvocation.irVersionOverride,
                    absolutePathToPreview
                });
                if (remoteTaskHandlerResponse != null && remoteTaskHandlerResponse.createdSnippets) {
                    snippetsProducedBy.push(generatorInvocation);

                    if (
                        generatorInvocation.absolutePathToLocalSnippets != null &&
                        remoteTaskHandlerResponse.snippetsS3PreSignedReadUrl != null
                    ) {
                        await downloadSnippetsForTask({
                            snippetsS3PreSignedReadUrl: remoteTaskHandlerResponse.snippetsS3PreSignedReadUrl,
                            absolutePathToLocalSnippetJSON: generatorInvocation.absolutePathToLocalSnippets,
                            context: interactiveTaskContext
                        });
                    }
                }
            })
        )
    );

    const results = await Promise.all(interactiveTasks);
    if (results.some((didSucceed) => !didSucceed)) {
        context.failAndThrow();
    }

    await uploadDynamicIRsForSdkGeneration({
        projectConfig,
        organization,
        workspace,
        context,
        generatorGroup,
        version,
        token
    });

    return {
        snippetsProducedBy
    };
}

async function uploadDynamicIRsForSdkGeneration({
    projectConfig,
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    token
}: {
    projectConfig: fernConfigJson.ProjectConfig;
    organization: string;
    workspace: AbstractAPIWorkspace<unknown>;
    context: TaskContext;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    token: FernToken;
}): Promise<void> {
    if (generatorGroup.generators.length === 0) {
        return;
    }

    const firstGenerator = generatorGroup.generators[0];
    if (!firstGenerator) {
        return;
    }

    const settings = getBaseOpenAPIWorkspaceSettingsFromGeneratorInvocation(firstGenerator);
    const fernWorkspace = await workspace.toFernWorkspace({ context }, settings);

    const dynamicIRs = await generateDynamicIRsForSdkGenerators({
        workspace: fernWorkspace,
        organization,
        context,
        generatorGroup
    });

    if (!dynamicIRs || Object.keys(dynamicIRs).length === 0) {
        return;
    }

    const snippetName = fernWorkspace.workspaceName ?? projectConfig.organization;
    const sdkVersion = version ?? "latest";

    const fdr = createFdrService({ token: token.value });

    try {
        // biome-ignore lint/suspicious/noExplicitAny: Temporary workaround until FDR SDK is updated with getDynamicIrUploadUrls
        const register = fdr.api.v1.register as any;

        if (typeof register.getDynamicIrUploadUrls !== "function") {
            context.logger.debug(
                "Skipping dynamic IR upload: getDynamicIrUploadUrls not available in current FDR SDK version"
            );
            return;
        }

        const response = await register.getDynamicIrUploadUrls({
            orgId: CjsFdrSdk.OrgId(organization),
            snippetName,
            version: sdkVersion,
            languages: Object.keys(dynamicIRs)
        });

        if (response.ok) {
            await uploadDynamicIRs({
                dynamicIRs,
                dynamicIRUploadUrls: response.body.uploadUrls,
                context,
                snippetName
            });
        } else {
            context.logger.warn(`Failed to get dynamic IR upload URLs: ${response.error}`);
        }
    } catch (error) {
        context.logger.warn(`Failed to upload dynamic IRs for SDK generation: ${error}`);
    }
}

async function generateDynamicIRsForSdkGenerators({
    workspace,
    organization,
    context,
    generatorGroup
}: {
    workspace: FernWorkspace;
    organization: string;
    context: TaskContext;
    generatorGroup: generatorsYml.GeneratorGroup;
}): Promise<Record<string, DynamicIr> | undefined> {
    const languageSpecificIRs: Record<string, DynamicIr> = {};

    for (const generatorInvocation of generatorGroup.generators) {
        if (!generatorInvocation.language) {
            continue;
        }

        const dynamicGeneratorConfig = getDynamicGeneratorConfig({
            apiName: workspace.workspaceName ?? "",
            organization,
            generatorInvocation
        });

        let packageName = "";
        if (dynamicGeneratorConfig?.outputConfig.type === "publish") {
            switch (dynamicGeneratorConfig.outputConfig.value.type) {
                case "npm":
                case "nuget":
                case "pypi":
                case "rubygems":
                    packageName = dynamicGeneratorConfig.outputConfig.value.packageName;
                    break;
                case "maven":
                    packageName = dynamicGeneratorConfig.outputConfig.value.coordinate;
                    break;
                case "go":
                    packageName = dynamicGeneratorConfig.outputConfig.value.repoUrl;
                    break;
                case "swift":
                    packageName = dynamicGeneratorConfig.outputConfig.value.repoUrl;
                    break;
                case "crates":
                    packageName = dynamicGeneratorConfig.outputConfig.value.packageName;
                    break;
            }
        }

        if (
            generatorInvocation.language === "php" &&
            generatorInvocation.config &&
            typeof generatorInvocation.config === "object" &&
            "packageName" in generatorInvocation.config
        ) {
            packageName = (generatorInvocation.config as { packageName?: string }).packageName ?? "";
        }

        try {
            const irForDynamicSnippets = generateIntermediateRepresentation({
                workspace,
                generationLanguage: generatorInvocation.language,
                keywords: undefined,
                smartCasing: generatorInvocation.smartCasing,
                exampleGeneration: {
                    disabled: true,
                    skipAutogenerationIfManualExamplesExist: true,
                    skipErrorAutogenerationIfManualErrorExamplesExist: true
                },
                audiences: {
                    type: "all"
                },
                readme: undefined,
                packageName,
                version: undefined,
                context,
                sourceResolver: new SourceResolverImpl(context, workspace),
                dynamicGeneratorConfig
            });

            const dynamicIR = convertIrToDynamicSnippetsIr({
                ir: irForDynamicSnippets,
                disableExamples: true,
                smartCasing: generatorInvocation.smartCasing,
                generationLanguage: generatorInvocation.language,
                generatorConfig: dynamicGeneratorConfig
            });

            if (dynamicIR) {
                languageSpecificIRs[generatorInvocation.language] = {
                    dynamicIR
                };
                context.logger.debug(`Generated dynamic IR for ${generatorInvocation.language}`);
            } else {
                context.logger.debug(`Failed to create dynamic IR for ${generatorInvocation.language}`);
            }
        } catch (error) {
            context.logger.warn(`Error generating dynamic IR for ${generatorInvocation.language}: ${error}`);
        }
    }

    if (Object.keys(languageSpecificIRs).length > 0) {
        return languageSpecificIRs;
    }

    return undefined;
}

async function uploadDynamicIRs({
    dynamicIRs,
    dynamicIRUploadUrls,
    context,
    snippetName
}: {
    dynamicIRs: Record<string, DynamicIr>;
    dynamicIRUploadUrls: Record<string, DynamicIrUpload>;
    context: TaskContext;
    snippetName: string;
}): Promise<void> {
    if (Object.keys(dynamicIRUploadUrls).length > 0) {
        for (const [language, source] of Object.entries(dynamicIRUploadUrls)) {
            const dynamicIR = dynamicIRs[language]?.dynamicIR;

            if (dynamicIR) {
                const response = await fetch(source.uploadUrl, {
                    method: "PUT",
                    body: JSON.stringify(dynamicIR),
                    headers: {
                        "Content-Type": "application/octet-stream",
                        "Content-Length": JSON.stringify(dynamicIR).length.toString()
                    }
                });

                if (response.ok) {
                    context.logger.debug(`Uploaded dynamic IR for ${snippetName}:${language}`);
                } else {
                    context.logger.warn(`Failed to upload dynamic IR for ${snippetName}:${language}`);
                }
            } else {
                context.logger.warn(`Could not find matching dynamic IR to upload for ${snippetName}:${language}`);
            }
        }
    }
}
