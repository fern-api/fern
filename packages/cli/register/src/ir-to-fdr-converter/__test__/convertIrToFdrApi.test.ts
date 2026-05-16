/* eslint-disable jest/valid-describe-callback */
/* eslint-disable jest/valid-title */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { FdrAPI as FdrCjsSdk } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
// import { loadApis } from "@fern-api/project-loader"; // Commented out to avoid cyclic dependency
import { createMockTaskContext } from "@fern-api/task-context";
import { readdir } from "fs/promises";
import path from "path";
import { convertIrToFdrApi } from "../convertIrToFdrApi.js";
// import { loadAPIWorkspace } from "../../../../workspace/loader/src/loadAPIWorkspace"; // Commented out to avoid cyclic dependency
import { withFallbackExamplesForUnresolvedTypeReferences } from "../convertPackage.js";

describe("withFallbackExamplesForUnresolvedTypeReferences", () => {
    it("adds placeholder examples only for unresolved generated example paths", () => {
        const endpoint = {
            slug: undefined,
            availability: undefined,
            auth: undefined,
            authV2: undefined,
            multiAuth: undefined,
            defaultEnvironment: undefined,
            environments: undefined,
            method: "GET",
            id: FdrCjsSdk.EndpointId("getThing"),
            originalEndpointId: "getThing",
            name: "Get Thing",
            description: undefined,
            path: {
                parts: [{ type: "literal", value: "/thing" }],
                pathParameters: []
            },
            queryParameters: [],
            headers: [],
            responseHeaders: undefined,
            request: undefined,
            requestsV2: { requests: undefined },
            response: {
                statusCode: 200,
                description: undefined,
                type: {
                    type: "reference",
                    value: {
                        type: "id",
                        value: FdrCjsSdk.TypeId("MissingSuccessType"),
                        default: undefined
                    }
                }
            },
            responsesV2: { responses: undefined },
            errors: undefined,
            errorsV2: [
                {
                    statusCode: 404,
                    description: undefined,
                    availability: undefined,
                    headers: undefined,
                    isWildcard: undefined,
                    name: "Missing",
                    examples: [],
                    type: {
                        type: "alias",
                        value: {
                            type: "id",
                            value: FdrCjsSdk.TypeId("MissingErrorType"),
                            default: undefined
                        }
                    }
                }
            ],
            examples: [],
            protocol: { type: "rest" },
            includeInApiExplorer: true
        } satisfies FdrCjsSdk.api.v1.register.EndpointDefinition;

        const result = withFallbackExamplesForUnresolvedTypeReferences(endpoint, new Set());

        expect(result.examples).toHaveLength(2);
        expect(result.examples.map((example) => example.responseStatusCode)).toEqual([200, 404]);
        expect(result.examples[0]?.path).toBe("/thing");
        expect(endpoint.examples).toHaveLength(0);
    });
});

// Temporarily disabled to avoid cyclic dependency with @fern-api/project-loader
// biome-ignore lint/suspicious/noSkippedTests: Intentionally disabled due to cyclic dependency
describe.skip("fdr", async () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions");
    const FIXTURES_DIR = path.join(__dirname, "./fixtures");
    // Commenting out loadApis usage to avoid cyclic dependency
    /*
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
                        });
                    })
            )
        ).flat()
    ];
    */
    // biome-ignore lint/suspicious/noExplicitAny: skipped test with empty array
    const apiWorkspaces: any[] = [];

    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            const context = createMockTaskContext();
            const fernWorkspace = await workspace.toFernWorkspace({
                context
            });

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
            });

            const fdr = convertIrToFdrApi({
                ir,
                snippetsConfig: {
                    typescriptSdk: undefined,
                    pythonSdk: undefined,
                    javaSdk: undefined,
                    rubySdk: undefined,
                    goSdk: undefined,
                    csharpSdk: undefined,
                    phpSdk: undefined,
                    swiftSdk: undefined,
                    rustSdk: undefined
                },
                playgroundConfig: {
                    oauth: true
                },
                context: createMockTaskContext()
            });

            it(workspace.workspaceName ?? "", async () => {
                await expect(JSON.stringify(fdr, undefined, 2)).toMatchFileSnapshot(
                    `./__snapshots__/fdr/${
                        workspace.workspaceName ?? workspace.absoluteFilePath.split("/").reverse()[1]
                    }.json`
                );
            });
        })
    );
});

describe("oas-ir-fdr", async () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../api-importers/v3-importer-tests/src/__test__");
    const FIXTURES_DIR = path.join(TEST_DEFINITIONS_DIR, "fixtures");
    const filterFixture = process.env.TEST_FIXTURE;

    for (const fixture of await readdir(FIXTURES_DIR, { withFileTypes: true })) {
        if (!fixture.isDirectory() || (filterFixture && fixture.name !== filterFixture)) {
            continue;
        }

        it(fixture.name, async () => {
            const fixturePath = join(
                AbsoluteFilePath.of(FIXTURES_DIR),
                RelativeFilePath.of(fixture.name),
                RelativeFilePath.of("fern")
            );
            const context = createMockTaskContext();
            // Commented out loadAPIWorkspace usage to avoid cyclic dependency
            /*
            const workspace = await loadAPIWorkspace({
                absolutePathToWorkspace: fixturePath,
                context,
                cliVersion: "0.0.0",
                workspaceName: fixture.name
            });
            */
            // Commenting out rest of test logic that depends on workspace
            /*
            if (!workspace.didSucceed) {
                throw new Error(
                    `Failed to load OpenAPI fixture ${fixture.name}\n${JSON.stringify(workspace.failures)}`
                );
            }

            if (workspace.workspace instanceof OSSWorkspace) {
                const ossWorkspace = workspace.workspace as OSSWorkspace;
                const intermediateRepresentation = await ossWorkspace.getIntermediateRepresentation({
                    context,
                    audiences: { type: "all" },
                    enableUniqueErrorsPerEndpoint: true,
                    generateV1Examples: false,
                    logWarnings: false
                });

                const fdr = convertIrToFdrApi({
                    ir: intermediateRepresentation,
                    snippetsConfig: {
                        typescriptSdk: undefined,
                        pythonSdk: undefined,
                        javaSdk: undefined,
                        rubySdk: undefined,
                        goSdk: undefined,
                        csharpSdk: undefined,
                        phpSdk: undefined,
                        swiftSdk: undefined,
                        rustSdk: undefined
                    },
                    playgroundConfig: {
                        oauth: true
                    },
                    context: createMockTaskContext()
                });

                await expect(JSON.stringify(fdr, undefined, 2)).toMatchFileSnapshot(
                    `./__snapshots__/oas-ir-fdr/${fixture.name}.json`
                );
            }
            */
        }, 90_000);
    }
});
