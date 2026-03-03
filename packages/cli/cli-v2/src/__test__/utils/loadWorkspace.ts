import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { NOOP_LOGGER } from "@fern-api/logger";
import { join } from "path";
import type { FernYmlSchemaLoader } from "../../config/fern-yml/FernYmlSchemaLoader.js";
import { loadFernYml } from "../../config/fern-yml/loadFernYml.js";
import type { Workspace } from "../../workspace/Workspace.js";
import { WorkspaceLoader } from "../../workspace/WorkspaceLoader.js";
import { FIXTURES_DIR } from "./constants.js";

export interface LoadWorkspaceWithFernYmlResult {
    fernYml: FernYmlSchemaLoader.Success;
    workspace: Workspace;
}

export async function loadWorkspaceWithFernYml(fixtureName: string): Promise<LoadWorkspaceWithFernYmlResult> {
    const cwd = AbsoluteFilePath.of(join(FIXTURES_DIR, fixtureName));
    const fernYml = await loadFernYml({ cwd });
    const loader = new WorkspaceLoader({ cwd, logger: NOOP_LOGGER });
    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new Error(`Failed to load fixture ${fixtureName}: ${JSON.stringify(result.issues)}`);
    }
    return { workspace: result.workspace, fernYml };
}

export async function loadWorkspace(fixtureName: string): Promise<Workspace> {
    const { workspace } = await loadWorkspaceWithFernYml(fixtureName);
    return workspace;
}
