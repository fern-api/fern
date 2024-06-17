import { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace, convertOpenApiWorkspaceToFernWorkspace } from "@fern-api/workspace-loader";
import path from "path";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

require("jest-specific-snapshot");

const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions-openapi");

const TEST_DEFINITION_CONFIG: Record<string, TestConfig> = {
    audiences: {
        audiences: { type: "select", audiences: ["public"] }
    }
};

interface TestConfig {
    audiences?: Audiences;
}

it("generate IR from OpenAPI", async () => {
    let apiWorkspaces: APIWorkspace[] = [];
    const taskContext = createMockTaskContext();
    // Test definitions
    apiWorkspaces = await loadApis({
        fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
        context: taskContext,
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true,
        sdkLanguage: undefined
    });

    for (let workspace of apiWorkspaces) {
        const name = workspace.absoluteFilepath.split("/").pop();
        if (workspace.type === "oss") {
            workspace = await convertOpenApiWorkspaceToFernWorkspace(workspace, taskContext, false, undefined);
        }

        const intermediateRepresentation = await generateIntermediateRepresentation({
            workspace,
            generationLanguage: undefined,
            audiences: TEST_DEFINITION_CONFIG[workspace.name]?.audiences ?? { type: "all" },
            keywords: undefined,
            smartCasing: true, // Verify the special casing convention in tests.
            disableExamples: false,
            readme: undefined
        });

        const intermediateRepresentationJson = await IrSerialization.IntermediateRepresentation.jsonOrThrow(
            intermediateRepresentation,
            {
                unrecognizedObjectKeys: "strip"
            }
        );
        expect(intermediateRepresentationJson).toMatchSpecificSnapshot(`__snapshots__/openapi/${name}.txt`);
    }
});