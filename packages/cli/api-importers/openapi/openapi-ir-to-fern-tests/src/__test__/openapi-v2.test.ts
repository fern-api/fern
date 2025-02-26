import { readdir } from "fs/promises";

import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const filterFixture = process.env.TEST_FIXTURE;

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("openapi-v2", async () => {
    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && fixture.name !== filterFixture)) {
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

                if (workspace.workspace instanceof OSSWorkspace) {
                    const intermediateRepresentation = await (
                        workspace.workspace as OSSWorkspace
                    ).getIntermediateRepresentation({ context });
                    // eslint-disable-next-line jest/no-standalone-expect
                    await expect(JSON.stringify(intermediateRepresentation, undefined, 2)).toMatchFileSnapshot(
                        `./__snapshots__/openapi-v2/${fixture.name}.json`
                    );
                }
            },
            90_000
        );
    }
});
