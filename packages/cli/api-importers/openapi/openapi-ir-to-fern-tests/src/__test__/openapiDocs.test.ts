import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { readdir } from "fs/promises";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("openapi-ir-to-fern docs", async () => {
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
                const definition = await workspace.workspace.getDefinition(
                    { context },
                    { enableUniqueErrorsPerEndpoint: true, preserveSchemaIds: true }
                );

                // The absoluteFilePath is not stable across environments, so we remove it from the snapshot.
                const { absoluteFilePath, ...filteredDefinition } = definition;

                // eslint-disable-next-line jest/no-standalone-expect
                expect(filteredDefinition).toMatchFileSnapshot(`./__snapshots__/openapi-docs/${fixture.name}.json`);
            },
            90_000
        );
    }
});
