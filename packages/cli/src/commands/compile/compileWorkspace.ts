import { loadWorkspaceDefinition } from "@fern-api/commons";
import { compile } from "@fern-api/compiler";
import { runLocalGenerationForWorkspace } from "@fern-api/local-workspace-runner";
import { handleCompilerFailure } from "./handleCompilerFailure";
import { parseFernDefinition } from "./parseFernInput";

export async function compileWorkspace({
    absolutePathToWorkspaceDefinition,
    absolutePathToProjectConfig,
}: {
    absolutePathToWorkspaceDefinition: string;
    absolutePathToProjectConfig: string | undefined;
}): Promise<void> {
    const workspaceDefinition = await loadWorkspaceDefinition(absolutePathToWorkspaceDefinition);

    const files = await parseFernDefinition(workspaceDefinition.absolutePathToDefinition);
    const compileResult = await compile(files, workspaceDefinition.name);
    if (!compileResult.didSucceed) {
        handleCompilerFailure(compileResult.failure);
        return;
    }

    await runLocalGenerationForWorkspace({
        workspaceDefinition,
        absolutePathToProjectConfig,
        compileResult,
    });
}
