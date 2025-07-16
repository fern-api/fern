/* eslint-disable jest/valid-describe-callback */
/* eslint-disable jest/valid-title */
/* eslint-disable @typescript-eslint/no-misused-promises */
import { readdir } from "fs/promises"
import path from "path"

import { SourceResolverImpl } from "@fern-api/cli-source-resolver"
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils"
import { generateIntermediateRepresentation } from "@fern-api/ir-generator"
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace"
import { loadApis } from "@fern-api/project-loader"
import { createMockTaskContext } from "@fern-api/task-context"

import { loadAPIWorkspace } from "../../../../workspace/loader/src/loadAPIWorkspace"
import { convertIrToFdrApi } from "../convertIrToFdrApi"

describe("fdr", async () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions")
    const FIXTURES_DIR = path.join(__dirname, "./fixtures")
    const apiWorkspaces = [
        ...(await loadApis({
            fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
            context: createMockTaskContext(),
            cliVersion: "0.0.0",
            cliName: "fern",
            commandLineApiWorkspace: undefined,
            defaultToAllApiWorkspaces: true
        })),
        ...(
            await Promise.all(
                (
                    await readdir(FIXTURES_DIR, { withFileTypes: true })
                )
                    .filter((fixture) => fixture.isDirectory())
                    .flatMap(async (fixture) => {
                        return await loadApis({
                            fernDirectory: join(
                                AbsoluteFilePath.of(FIXTURES_DIR),
                                RelativeFilePath.of(fixture.name),
                                RelativeFilePath.of("fern")
                            ),
                            context: createMockTaskContext(),
                            cliVersion: "0.0.0",
                            cliName: "fern",
                            commandLineApiWorkspace: undefined,
                            defaultToAllApiWorkspaces: true
                        })
                    })
            )
        ).flat()
    ]

    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            const context = createMockTaskContext()
            const fernWorkspace = await workspace.toFernWorkspace({
                context
            })

            const ir = generateIntermediateRepresentation({
                workspace: fernWorkspace,
                generationLanguage: undefined,
                audiences: { type: "all" },
                keywords: undefined,
                smartCasing: true,
                exampleGeneration: { disabled: false },
                readme: undefined,
                version: undefined,
                packageName: undefined,
                context,
                sourceResolver: new SourceResolverImpl(context, fernWorkspace)
            })

            const fdr = convertIrToFdrApi({
                ir,
                snippetsConfig: {
                    typescriptSdk: undefined,
                    pythonSdk: undefined,
                    javaSdk: undefined,
                    rubySdk: undefined,
                    goSdk: undefined,
                    csharpSdk: undefined
                },
                playgroundConfig: {
                    oauth: true
                }
            })

            it(workspace.workspaceName ?? "", () => {
                expect(JSON.stringify(fdr, undefined, 2)).toMatchFileSnapshot(
                    `./__snapshots__/fdr/${
                        workspace.workspaceName ?? workspace.absoluteFilePath.split("/").reverse()[1]
                    }.json`
                )
            })
        })
    )
})

describe("oas-ir-fdr", async () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../api-importers/v2-importer-tests/src/__test__")
    const FIXTURES_DIR = path.join(TEST_DEFINITIONS_DIR, "fixtures")
    const filterFixture = process.env.TEST_FIXTURE

    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && fixture.name !== filterFixture)) {
            continue
        }

        it(fixture.name, async () => {
            const fixturePath = join(
                AbsoluteFilePath.of(FIXTURES_DIR),
                RelativeFilePath.of(fixture.name),
                RelativeFilePath.of("fern")
            )
            const context = createMockTaskContext()
            const workspace = await loadAPIWorkspace({
                absolutePathToWorkspace: fixturePath,
                context,
                cliVersion: "0.0.0",
                workspaceName: fixture.name
            })
            if (!workspace.didSucceed) {
                throw new Error(`Failed to load OpenAPI fixture ${fixture.name}\n${JSON.stringify(workspace.failures)}`)
            }

            if (workspace.workspace instanceof OSSWorkspace) {
                const ossWorkspace = workspace.workspace as OSSWorkspace
                const intermediateRepresentation = await ossWorkspace.getIntermediateRepresentation({
                    context,
                    audiences: { type: "all" },
                    enableUniqueErrorsPerEndpoint: true,
                    generateV1Examples: false
                })

                const fdr = convertIrToFdrApi({
                    ir: intermediateRepresentation,
                    snippetsConfig: {
                        typescriptSdk: undefined,
                        pythonSdk: undefined,
                        javaSdk: undefined,
                        rubySdk: undefined,
                        goSdk: undefined,
                        csharpSdk: undefined
                    },
                    playgroundConfig: {
                        oauth: true
                    }
                })

                await expect(JSON.stringify(fdr, undefined, 2)).toMatchFileSnapshot(
                    `./__snapshots__/oas-ir-fdr/${fixture.name}.json`
                )
            }
        }, 90_000)
    }
})
