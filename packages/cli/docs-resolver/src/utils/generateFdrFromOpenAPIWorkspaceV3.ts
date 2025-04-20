import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";

import { FernRegistry as FdrCjsSdk } from "@fern-fern/fdr-cjs-sdk";

export async function generateFdrFromOpenApiWorkspaceV3(
    workspace: AbstractAPIWorkspace<unknown>,
    context: TaskContext
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition | undefined> {
    if (workspace instanceof LazyFernWorkspace) {
        context.logger.info("Skipping, API is specified as a Fern Definition.");
        return;
    } else if (!(workspace instanceof OSSWorkspace)) {
        return;
    }

    const intermediateRepresentation = await workspace.getIntermediateRepresentation({
        context
    });

    return convertIrToFdrApi({
        ir: intermediateRepresentation,
        snippetsConfig: {
            typescriptSdk: undefined,
            pythonSdk: undefined,
            javaSdk: undefined,
            rubySdk: undefined,
            goSdk: undefined,
            csharpSdk: undefined
        },
        playgroundConfig: {
            oauth: true
        }
    });
}
