import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { loadAPIWorkspace } from "@fern-api/workspace-loader";
import { readdir } from "fs/promises";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));
const filterFixture = process.env.TEST_FIXTURE;

const DOCS_MODE_FIXTURES = new Set([
    "deel",
    "belvo",
    "rightbrain",
    "aries",
    "squidex",
    "only-include-referenced-schemas",
    "inline-schema-reference",
    "preserve-single-schema-oneof",
    "openapi-filter",
    "hookdeck"
]);

const docsFixturesOverride = process.env.TEST_DOCS_FIXTURES;
if (docsFixturesOverride) {
    DOCS_MODE_FIXTURES.clear();
    docsFixturesOverride.split(",").forEach((name) => DOCS_MODE_FIXTURES.add(name.trim()));
}

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("openapi-ir-to-fern", async () => {
    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && !fixture.name.includes(filterFixture))) {
            continue;
        }

        it(`${fixture.name} (default)`, async () => {
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

            await expect(definition).toMatchFileSnapshot(`./__snapshots__/openapi/${fixture.name}.json`);
        }, 90_000);

        if (DOCS_MODE_FIXTURES.has(fixture.name)) {
            it(`${fixture.name} (docs)`, async () => {
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
                    {
                        context,
                        absoluteFilePath: AbsoluteFilePath.of("/DUMMY_PATH")
                    },
                    { enableUniqueErrorsPerEndpoint: true, preserveSchemaIds: true }
                );

                await expect(definition).toMatchFileSnapshot(`./__snapshots__/openapi-docs/${fixture.name}.json`);
            }, 90_000);
        }
    }
});
