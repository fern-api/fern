import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { TestResult } from "./utils/TestResult";
import { generateDynamicSnippetsTestSuite } from "@fern-api/dynamic-snippets";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DynamicSnippetsGenerator } from "..";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";
import { GoFormatter } from "@fern-api/go-formatter";

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
                const test = await generateDynamicSnippetsTestSuite({
                    ir: await getIntermediateRepresentation({ workspace }),
                    config: buildGeneratorConfig()
                });
                const generator = new DynamicSnippetsGenerator({
                    ir: test.ir,
                    config: test.config,
                    formatter: new GoFormatter()
                });
                const result = new TestResult();
                for (const request of test.requests) {
                    const response = await generator.generate(request);
                    result.addSnippet(response.snippet);
                }
                expect(result.toString()).toMatchSnapshot();
            });
        })
    );
});

async function getIntermediateRepresentation({
    workspace
}: {
    workspace: AbstractAPIWorkspace<unknown>;
}): Promise<IntermediateRepresentation> {
    const context = createMockTaskContext();
    const fernWorkspace = await workspace.toFernWorkspace({
        context
    });
    return generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: "go",
        keywords: undefined,
        smartCasing: true,
        disableExamples: false,
        includeOptionalRequestPropertyExamples: true,
        readme: undefined,
        packageName: undefined,
        version: undefined,
        audiences: { type: "all" },
        context
    });
}
