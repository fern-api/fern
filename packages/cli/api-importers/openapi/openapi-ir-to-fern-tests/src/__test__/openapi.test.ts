import { readdir } from "fs/promises";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("openapi-ir-to-fern", async () => {
    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory()) {
            continue;
        }

        it(
            fixture.name,
            async () => {
                const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name), RelativeFilePath.of("fern"));
                const context = createMockTaskContext();
                const workspace = await loadAPIWorkspace({
                    absolutePathToWorkspace: fixturePath,
                    context,
                    cliVersion: "0.0.0",
                    workspaceName: fixture.name
                });
                if (!workspace.didSucceed) {
                    throw new Error(
                        `Failed to load OpenAPI fixture ${fixture.name}\n${JSON.stringify(workspace.failures)}`
                    );
                }
                const definition = await workspace.workspace.getDefinition({
                    context,
                    absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH")
                });

                // eslint-disable-next-line jest/no-standalone-expect
                expect(definition).toMatchFileSnapshot(`./__snapshots__/openapi/${fixture.name}.json`);
            },
            90_000
        );
    }
});
