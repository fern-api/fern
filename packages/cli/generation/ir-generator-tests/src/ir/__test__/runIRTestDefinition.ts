import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import path from "path";

import { generateAndSnapshotIR } from "./generateAndSnapshotIR.js";

const REPO_ROOT = path.resolve(__dirname, "../../../../../../..");

export async function runIRTestDefinition({
    fixtureName,
    testDefinitionsSource,
    audiences
}: {
    fixtureName: string;
    testDefinitionsSource: string;
    audiences?: { type: "select"; audiences: string[] } | { type: "all" };
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
    await generateAndSnapshotIR({
        absolutePathToIr: AbsoluteFilePath.of(snapshotDir),
        workspace: workspace.workspace,
        audiences: audiences ?? { type: "all" },
        workspaceName: fixtureName
    });
}
