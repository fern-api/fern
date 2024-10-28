import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { TestResult } from "./utils/TestResult";
import { generateDynamicSnippetsTestSuite } from "@fern-api/dynamic-snippets";
import { buildGeneratorConfig } from "./utils/buildGeneratorConfig";
import { DynamicSnippetsGenerator } from "..";

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
                    workspace,
                    config: buildGeneratorConfig(),
                    language: "go",
                    audiences: { type: "all" }
                });
                const generator = new DynamicSnippetsGenerator({ ir: test.ir, config: test.config });
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
