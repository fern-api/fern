import { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import path from "path";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions-openapi");
const IR_DIR = path.join(__dirname, "openapi-irs");

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
        defaultToAllApiWorkspaces: true
    });

    for (const workspace of apiWorkspaces) {
        const fernWorkspace = await workspace.toFernWorkspace({ context: taskContext });
        if (fernWorkspace.workspaceName == null) {
            continue;
        }

        const intermediateRepresentation = await generateIntermediateRepresentation({
            workspace: fernWorkspace,
            generationLanguage: undefined,
            audiences: TEST_DEFINITION_CONFIG[fernWorkspace.workspaceName]?.audiences ?? { type: "all" },
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

        await writeFile(
            join(AbsoluteFilePath.of(IR_DIR), RelativeFilePath.of(`${workspace.workspaceName ?? "ir"}.json`)),
            await stringifyLargeObject(intermediateRepresentationJson, { pretty: true })
        );
    }
});
