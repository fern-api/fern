import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace } from "@fern-api/workspace-loader";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import path from "path";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

require("jest-specific-snapshot");

const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions");

const TEST_DEFINITION_CONFIG: Record<string, TestConfig> = {
    audiences: {
        audiences: { type: "select", audiences: ["public"] },
    },
};

interface TestConfig {
    audiences?: Audiences;
}

it("generate IR", async () => {
    let apiWorkspaces: APIWorkspace[] = [];

    apiWorkspaces = await loadApis({
        fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true,
    });

    for (const workspace of apiWorkspaces) {
        if (workspace.type === "openapi") {
            throw new Error("Convert OpenAPI to Fern workspace before generating IR");
        }

        const intermediateRepresentation = await generateIntermediateRepresentation({
            workspace,
            generationLanguage: undefined,
            audiences: TEST_DEFINITION_CONFIG[workspace.name]?.audiences ?? { type: "all" },
        });

        const intermediateRepresentationJson = await IrSerialization.IntermediateRepresentation.jsonOrThrow(
            intermediateRepresentation,
            {
                unrecognizedObjectKeys: "strip",
            }
        );
        expect(intermediateRepresentationJson).toMatchSpecificSnapshot(`__snapshots__/${workspace.name}.txt`);
    }
});
