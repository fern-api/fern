import { AbstractAPIWorkspace } from "@fern-api/api-workspace-commons";
import { Audiences } from "@fern-api/configuration";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { LazyFernWorkspace, OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { convertIrToFdrApi } from "@fern-api/register";
import { TaskContext } from "@fern-api/task-context";

export async function generateFdrFromOpenApiWorkspaceV3(
    workspace: AbstractAPIWorkspace<unknown>,
    context: TaskContext,
    audiences: Audiences
): Promise<FdrCjsSdk.api.v1.register.ApiDefinition | undefined> {
    if (workspace instanceof LazyFernWorkspace) {
        context.logger.info("Skipping, API is specified as a Fern Definition.");
        return;
    } else if (!(workspace instanceof OSSWorkspace)) {
        return;
    }

    const intermediateRepresentation = await workspace.getIntermediateRepresentation({
        context,
        audiences,
        enableUniqueErrorsPerEndpoint: true,
        generateV1Examples: false,
        logWarnings: false
    });

    return convertIrToFdrApi({
        ir: intermediateRepresentation,
        snippetsConfig: {
            typescriptSdk: undefined,
            pythonSdk: undefined,
            javaSdk: undefined,
            rubySdk: undefined,
            goSdk: undefined,
            csharpSdk: undefined,
            phpSdk: undefined,
            swiftSdk: undefined,
            rustSdk: undefined
        },
        playgroundConfig: {
            oauth: true
        },
        context
    });
}
