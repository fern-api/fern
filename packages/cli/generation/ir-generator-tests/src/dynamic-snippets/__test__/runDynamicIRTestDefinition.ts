import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import path from "path";

import { generateAndSnapshotDynamicIR } from "./generateAndSnapshotDynamicIR.js";

const REPO_ROOT = path.resolve(__dirname, "../../../../../../..");

export async function runDynamicIRTestDefinition({
    fixtureName,
    testDefinitionsSource
}: {
    fixtureName: string;
    testDefinitionsSource: string;
}): Promise<void> {
    const testDefinitionsDir = path.join(REPO_ROOT, testDefinitionsSource);
    const workspacePath = path.join(testDefinitionsDir, "fern/apis", fixtureName);
    const snapshotDir = path.join(__dirname, testDefinitionsSource);

    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace: AbsoluteFilePath.of(workspacePath),
        context,
        cliVersion: "0.0.0",
        workspaceName: fixtureName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load workspace ${fixtureName}: ${JSON.stringify(workspace.failures)}`);
    }
    await generateAndSnapshotDynamicIR({
        absolutePathToIr: AbsoluteFilePath.of(snapshotDir),
        workspace: workspace.workspace,
        audiences: { type: "all" },
        workspaceName: fixtureName
    });
}
