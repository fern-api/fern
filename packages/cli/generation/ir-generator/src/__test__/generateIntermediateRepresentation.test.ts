import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";
import * as IrSerialization from "@fern-fern/ir-sdk/serialization";
import path from "path";
// import * as prettier from "prettier";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

require("jest-specific-snapshot");

const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions");
const FHIR_DIR = path.join(__dirname, "../../../../../../fern/apis/fhir");

const TEST_DEFINITION_CONFIG: Record<string, TestConfig> = {
    audiences: {
        audiences: { type: "select", audiences: ["public"] }
    }
};

interface TestConfig {
    audiences?: Audiences;
}

it("generate IR", async () => {
    let apiWorkspaces: APIWorkspace[] = [];

    // Test definitions
    apiWorkspaces = await loadApis({
        fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    // FHIR
    // The FHIR API definition is huge and we previously encountered issues with serializing it.
    // Here we add the FHIR spec to the list of API definitions to test. If this test doesn't
    // error out, we know that the FHIR spec can be serialized.
    const fhirWorkspace = await loadAPIWorkspace({
        absolutePathToWorkspace: AbsoluteFilePath.of(FHIR_DIR),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        workspaceName: "fhir"
    });
    if (fhirWorkspace.didSucceed) {
        apiWorkspaces.push(fhirWorkspace.workspace);
    }

    for (const workspace of apiWorkspaces) {
        if (workspace.type === "openapi") {
            throw new Error("Convert OpenAPI to Fern workspace before generating IR");
        }

        const intermediateRepresentation = await generateIntermediateRepresentation({
            workspace,
            generationLanguage: undefined,
            audiences: TEST_DEFINITION_CONFIG[workspace.name]?.audiences ?? { type: "all" },
            smartCasing: true, // Verify the special casing convention in tests.
            disableExamples: false
        });

        const intermediateRepresentationJson = await IrSerialization.IntermediateRepresentation.jsonOrThrow(
            intermediateRepresentation,
            {
                unrecognizedObjectKeys: "strip"
            }
        );
        expect(intermediateRepresentationJson).toMatchSpecificSnapshot(`__snapshots__/${workspace.name}.txt`);
    }
});
