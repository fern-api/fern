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
const AUDIENCES_DIR = path.join(__dirname, "fixtures/audiences/fern");

const TEST_DEFINITION_CONFIG: Record<string, TestConfig> = {
    audiences: {
        audiences: { type: "select", audiences: ["external"] }
    }
};

interface TestConfig {
    audiences?: Audiences;
}

it("generate IR", async () => {
    const apiWorkspaces: APIWorkspace[] = [];

    // Test for scale
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

    // Test for audiences
    const audiences = await loadAPIWorkspace({
        absolutePathToWorkspace: AbsoluteFilePath.of(AUDIENCES_DIR),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        workspaceName: "audiences",
        sdkLanguage: undefined
    });
    if (audiences.didSucceed) {
        apiWorkspaces.push(audiences.workspace);
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
        expect(intermediateRepresentationJson).toMatchSpecificSnapshot(`__snapshots__/${workspace.workspaceName}.txt`);
    }
});
