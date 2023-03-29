import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadWorkspace } from "../loadWorkspace";

describe("loadWorkspace", () => {
    it("loads workspace", async () => {
        const workspace = await loadWorkspace({
            absolutePathToWorkspace: join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures/simple")),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
        });
        expect(workspace.didSucceed).toBe(true);
    });
});
