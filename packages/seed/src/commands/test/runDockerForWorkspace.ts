import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { runLocalGenerationForSeed } from "@fern-api/local-workspace-runner";
import { TaskContext } from "@fern-api/task-context";
import { FernWorkspace } from "@fern-api/workspace-loader";
import { writeInputs } from "../../commands/rewrite-inputs/rewriteInputsForWorkspace";
import { OutputMode } from "../../config/api";
import { ALL_AUDIENCES, DUMMY_ORGANIZATION } from "../../utils/constants";
import { getGeneratorInvocation } from "../../utils/getGeneratorInvocation";
import { ParsedDockerName } from "../../utils/parseDockerOrThrow";

export async function runDockerForWorkspace({
    absolutePathToOutput,
    docker,
    language,
    workspace,
    taskContext,
    customConfig,
    publishConfig,
    selectAudiences,
    irVersion,
    outputVersion,
    outputMode,
    fixtureName,
    keepDocker,
    publishMetadata
}: {
    absolutePathToOutput: AbsoluteFilePath;
    docker: ParsedDockerName;
    language: generatorsYml.GenerationLanguage | undefined;
    workspace: FernWorkspace;
    taskContext: TaskContext;
    customConfig: unknown;
    publishConfig: unknown;
    selectAudiences?: string[];
    irVersion: string;
    outputVersion?: string;
    outputMode: OutputMode;
    fixtureName: string;
    keepDocker: boolean | undefined;
    publishMetadata: unknown;
}): Promise<void> {
    try {
        const generatorGroup: generatorsYml.GeneratorGroup = {
            groupName: "test",
            audiences: selectAudiences != null ? { type: "select", audiences: selectAudiences } : ALL_AUDIENCES,
            generators: [
                getGeneratorInvocation({
                    absolutePathToOutput,
                    docker,
                    language,
                    customConfig,
                    publishConfig,
                    outputMode,
                    fixtureName,
                    irVersion,
                    publishMetadata
                })
            ]
        };
        await runLocalGenerationForSeed({
            organization: DUMMY_ORGANIZATION,
            absolutePathToFernConfig: undefined,
            workspace,
            generatorGroup,
            keepDocker: keepDocker ?? false,
            context: taskContext,
            irVersionOverride: irVersion,
            outputVersionOverride: outputVersion
        });
    } catch (e) {
        throw e;
    } finally {
        writeInputs({
            absolutePathToOutput,
            fernWorkspace: workspace,
            taskContext,
            docker,
            language,
            customConfig,
            publishConfig,
            outputMode,
            fixtureName,
            irVersion,
            publishMetadata,
            workspaceName: workspace.name,
            context: taskContext
        });
    }
}
