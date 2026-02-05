import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { join } from "path";
import { ApiDefinition } from "../../api/config/ApiDefinition";
import { loadFernYml } from "../../config/fern-yml/loadFernYml";
import { WorkspaceLoader } from "../../workspace/WorkspaceLoader";
import { FIXTURES_DIR } from "./constants";
/**
 * Loads an workspace from a fixture directory and returns the ApiDefinition.
 */
export async function loadApiDefinition(fixtureName: string): Promise<{
    cwd: AbsoluteFilePath;
    apiDefinition: ApiDefinition;
}> {
    const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, fixtureName));
    const fernYml = await loadFernYml({ cwd });
    const loader = new WorkspaceLoader({ cwd, logger: NOOP_LOGGER });

    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new Error(`Failed to load fixture ${fixtureName}: ${JSON.stringify(result.issues)}`);
    }

    const apiDefinition = result.workspace.apis["api"];
    if (apiDefinition == null) {
        throw new Error(`Fixture ${fixtureName} has no 'api' definition`);
    }

    return { cwd, apiDefinition };
}
