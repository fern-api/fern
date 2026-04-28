import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { readdirSync } from "fs";
import path from "path";

import { loadApisOrThrow } from "../../loadApisOrThrow.js";
import { generateAndSnapshotDynamicIR } from "./generateAndSnapshotDynamicIR.js";

describe("test definitions", () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../../test-definitions");
    const apiNames = readdirSync(path.join(TEST_DEFINITIONS_DIR, "fern/apis"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name);

    let workspaceMap: Map<string, AbstractAPIWorkspace<unknown>>;

    beforeAll(async () => {
        const apiWorkspaces = await loadApisOrThrow({
            fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
            cliName: "fern",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true
        });
        workspaceMap = new Map(apiWorkspaces.map((w) => [w.workspaceName ?? "", w]));
    }, 200_000);

    apiNames.forEach((name) => {
        it.concurrent(name, async () => {
            const workspace = workspaceMap.get(name);
            if (!workspace) {
                throw new Error(`Workspace ${name} not found`);
            }
            await generateAndSnapshotDynamicIR({
                absolutePathToIr: AbsoluteFilePath.of(path.join(__dirname, "test-definitions")),
                workspace,
                audiences: { type: "all" },
                workspaceName: name
            });
        }, 60_000);
    });
});
