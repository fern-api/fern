import { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";
import path from "path";
// import * as prettier from "prettier";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

require("jest-specific-snapshot");

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
    const apiWorkspaces: APIWorkspace[] = [];
    // FHIR
    // The FHIR API definition is huge and we previously encountered issues with serializing it.
    // Here we add the FHIR spec to the list of API definitions to test. If this test doesn't
    // error out, we know that the FHIR spec can be serialized.
    const fhirWorkspace = await loadAPIWorkspace({
        absolutePathToWorkspace: AbsoluteFilePath.of(FHIR_DIR),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        workspaceName: "fhir",
        sdkLanguage: undefined
    });
    if (fhirWorkspace.didSucceed) {
        apiWorkspaces.push(fhirWorkspace.workspace);
    }

    for (const workspace of apiWorkspaces) {
        if (workspace.type === "oss") {
            throw new Error("Convert OpenAPI to Fern workspace before generating IR");
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
        expect(intermediateRepresentationJson).toMatchSpecificSnapshot(`__snapshots__/${workspace.name}.txt`);
    }
});
