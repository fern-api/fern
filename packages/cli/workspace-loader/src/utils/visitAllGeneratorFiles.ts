import { generatorsYml } from "@fern-api/configuration";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { FernWorkspace } from "../types/Workspace";

export async function visitAllGeneratorFiles(
    workspace: FernWorkspace,
    visitor: (
        filepath: RelativeFilePath,
        generatorsConfig: generatorsYml.GeneratorsConfigurationSchema
    ) => void | Promise<void>
): Promise<void> {
    if (workspace.generatorsConfiguration != null) {
        await visitor(
            workspace.generatorsConfiguration.relativePathToConfiguration,
            workspace.generatorsConfiguration.rawConfiguration
        );
    }
}
