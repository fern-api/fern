import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES: Fixture[] = [
    {
        name: "debug"
    },
    {
        name: "trace"
    }
];

interface Fixture {
    name: string;
    only?: boolean;
}

describe("ir", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
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
                        `Failed to convert conjure fixture ${fixture.name}\n${JSON.stringify(workspace.failures)}`
                    );
                }
                // eslint-disable-next-line jest/no-standalone-expect
                expect(
                    JSON.stringify(await workspace.workspace.getDefinition({ context }), undefined, 2)
                ).toMatchFileSnapshot(`__snapshots__/${fixture.name}.json`);
            },
            90_000
        );
    }
});
