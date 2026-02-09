import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { join } from "path";
import { loadFernYml } from "../../config/fern-yml/loadFernYml.js";
import { Workspace } from "../../workspace/Workspace.js";
import { WorkspaceLoader } from "../../workspace/WorkspaceLoader.js";
import { FIXTURES_DIR } from "./constants.js";

export async function loadWorkspace(fixtureName: string): Promise<Workspace> {
    const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, fixtureName));
    const fernYml = await loadFernYml({ cwd });
    const loader = new WorkspaceLoader({ cwd, logger: NOOP_LOGGER });
    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new Error(`Failed to load fixture ${fixtureName}: ${JSON.stringify(result.issues)}`);
    }
    return result.workspace;
}
