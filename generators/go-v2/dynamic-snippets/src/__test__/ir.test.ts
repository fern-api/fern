import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { generateDynamicTestCase } from "./utils/generateDynamicTestCase";

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("test definitions", async () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../test-definitions");
    const apiWorkspaces = await loadApis({
        fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            it(`${workspace.workspaceName}`, async () => {
                const testCase = await generateDynamicTestCase({
                    workspace,
                    audiences: { type: "all" }
                });
                // TODO: Iterate over each endpoint example, and generate the snippet dynamically.
            });
        })
    );
});
