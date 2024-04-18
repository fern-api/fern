import { FernToken } from "@fern-api/auth";
import { generatorsYml } from "@fern-api/configuration";
import { createFdrTestService } from "@fern-api/core";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { SnippetRegistryEntry } from "@fern-fern/fdr-test-sdk/api";
import * as FdrSerialization from "@fern-fern/fdr-test-sdk/serialization";
import { FernFiddle } from "@fern-fern/fiddle-sdk";
import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { parse } from "path";
import { downloadSnippetsForTask } from "./downloadSnippetsForTask";
import { runRemoteGenerationForGenerator } from "./runRemoteGenerationForGenerator";

export interface RemoteGenerationForAPIWorkspaceResponse {
    snippetsProducedBy: generatorsYml.GeneratorInvocation[];
}

export async function runRemoteGenerationForAPIWorkspace({
    organization,
    workspace,
    context,
    generatorGroup,
    version,
    shouldLogS3Url,
    token,
    whitelabel,
    absolutePathToPreview
}: {
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    generatorGroup: generatorsYml.GeneratorGroup;
    version: string | undefined;
    shouldLogS3Url: boolean;
    token: FernToken;
    whitelabel: FernFiddle.WhitelabelConfig | undefined;
    absolutePathToPreview: AbsoluteFilePath | undefined;
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
                const remoteTaskHandlerResponse = await runRemoteGenerationForGenerator({
                    organization,
                    workspace,
                    interactiveTaskContext,
                    generatorInvocation,
                    version,
                    audiences: generatorGroup.audiences,
                    shouldLogS3Url,
                    token,
                    whitelabel,
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

                        await registerSnippetTemplatesToFdr({
                            token,
                            organization,
                            workspace,
                            context,
                            snippetsPath: generatorInvocation.absolutePathToLocalSnippets
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

    return {
        snippetsProducedBy
    };
}

async function registerSnippetTemplatesToFdr({
    token,
    organization,
    workspace,
    context,
    snippetsPath
}: {
    token: FernToken;
    organization: string;
    workspace: FernWorkspace;
    context: TaskContext;
    snippetsPath: AbsoluteFilePath;
}) {
    // Process snippet templates here:
    const fdr = createFdrTestService({ token: token.value });
    try {
        // TODO: This should live in generator exec, beside the snippets.json path
        const pathToSnippetTemplates = parse(snippetsPath).dir + "/snippet-templates.json";
        // Read in snippet templates from disk and submit to FDR for registration
        if (!existsSync(pathToSnippetTemplates)) {
            context.logger.warn("Snippet templates file not found, no templates registered.");
            return;
        }
        const templatesString = (await readFile(pathToSnippetTemplates)).toString();
        const templatesJson = JSON.parse(templatesString);
        if (!Array.isArray(templatesJson)) {
            context.logger.error("Snippet templates were malformed, continuing.");
            return;
        }
        const snippetTemplates: SnippetRegistryEntry[] = templatesJson.map((templateJson) =>
            FdrSerialization.SnippetRegistryEntry.parseOrThrow(templateJson, {
                unrecognizedObjectKeys: "passthrough"
            })
        );
        fdr.template.registerBatch({
            orgId: organization,
            apiId: workspace.name,
            snippets: snippetTemplates,
            // TODO: Store the API definition ID in the generator invocation for future retrieval
            apiDefinitionId: ""
        });
    } catch (e) {
        context.logger.error("Failed to register snippet templates, continuing.", e);
    }
}
