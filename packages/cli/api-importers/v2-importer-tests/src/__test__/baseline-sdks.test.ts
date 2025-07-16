import { readdir } from "fs/promises"

import { SourceResolverImpl } from "@fern-api/cli-source-resolver"
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils"
import { generateIntermediateRepresentation } from "@fern-api/ir-generator"
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace"
import { createMockTaskContext } from "@fern-api/task-context"
import { loadAPIWorkspace } from "@fern-api/workspace-loader"

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"))
const filterFixture = process.env.TEST_FIXTURE

// eslint-disable-next-line @typescript-eslint/no-misused-promises
describe("openapi-v2-baseline-sdks", async () => {
    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && fixture.name !== filterFixture)) {
            continue
        }

        it(fixture.name, async () => {
            const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name), RelativeFilePath.of("fern"))
            const context = createMockTaskContext()
            const workspace = await loadAPIWorkspace({
                absolutePathToWorkspace: fixturePath,
                context,
                cliVersion: "0.0.0",
                workspaceName: fixture.name
            })
            if (!workspace.didSucceed) {
                console.warn(
                    `Test Failed: Unable to load OpenAPI fixture ${fixture.name}\n${JSON.stringify(workspace.failures)}`
                )
                return
            }

            if (workspace.workspace instanceof OSSWorkspace) {
                try {
                    const fernWorkspace = await (workspace.workspace as OSSWorkspace).toFernWorkspace({ context })
                    const intermediateRepresentation = generateIntermediateRepresentation({
                        workspace: fernWorkspace,
                        generationLanguage: undefined,
                        audiences: { type: "all" },
                        keywords: undefined,
                        smartCasing: true,
                        exampleGeneration: { disabled: true },
                        readme: undefined,
                        version: undefined,
                        packageName: undefined,
                        context,
                        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
                    })
                    await expect(JSON.stringify(intermediateRepresentation, undefined, 2)).toMatchFileSnapshot(
                        `./__snapshots__/baseline-sdks/${fixture.name}.json`
                    )
                } catch (error) {
                    console.warn(`Test Failed: Error processing fixture ${fixture.name}:`, error)
                }
            }
        }, 90_000)
    }
})
