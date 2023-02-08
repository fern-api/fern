import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "@fern-api/workspace-loader";
import { ApiService } from "../generated/api/resources/api/service/ApiService";
import { convertIrToApi } from "../ir-to-api-converter/convertIrToApi";

const cliVersion = process.env.CLI_VERSION;
if (cliVersion == null) {
    throw new Error("CLI_VERSION is not defined.");
}

export default new ApiService({
    get: async (_request) => {
        const workspace = await loadWorkspace({
            absolutePathToWorkspace: "/Users/zachkirsch/Dropbox/Mac/Documents/fern/fern/ir-types-v8",
            context: createMockTaskContext(),
            cliVersion,
        });
        if (!workspace.didSucceed) {
            // eslint-disable-next-line no-console
            console.error(workspace.failures);
            throw new Error("Failed to load workspace");
        }
        const ir = await generateIntermediateRepresentation({
            workspace: workspace.workspace,
            generationLanguage: undefined,
            audiences: undefined,
        });
        return convertIrToApi(ir);
    },
});
