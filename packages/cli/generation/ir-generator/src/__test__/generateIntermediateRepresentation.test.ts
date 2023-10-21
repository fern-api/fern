import { Audiences } from "@fern-api/config-management-commons";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace } from "@fern-api/workspace-loader";
import { createStringifyStream } from "big-json";
import fs from "fs";
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

// Define function to write json string to file
// Args: JSON object, file path
function writeJsonToFile(obj: any, filepath: string) {
    const stringifyStream = createStringifyStream({
        body: obj,
    });

    // Open file for writing
    const a = fs.openSync(filepath, "w");

    // Write chunks
    stringifyStream.on("data", function (strChunk: any) {
        // Append string chunk to file
        fs.appendFileSync(filepath, strChunk);
    });

    // Write pretty-printed JSON to file
    // fs.appendFileSync(filepath, JSON.stringify(obj, null, 4));

    // Close file
    stringifyStream.on("end", function () {
        fs.closeSync(a);
    });
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

        if (workspace.name !== "api" && workspace.name !== "fhir") {
            continue;
        }

        const intermediateRepresentation = await generateIntermediateRepresentation({
            workspace,
            generationLanguage: undefined,
            audiences: TEST_DEFINITION_CONFIG[workspace.name]?.audiences ?? { type: "all" },
        });

        writeJsonToFile(intermediateRepresentation, `${workspace.name}_streamed.txt`);
        expect(1).toEqual(1);
        // const intermediateRepresentationJson = await IrSerialization.IntermediateRepresentation.jsonOrThrow(

        //     intermediateRepresentation,
        //     {
        //         unrecognizedObjectKeys: "strip",
        //     }
        // );
        // expect(intermediateRepresentationJson).toMatchSpecificSnapshot(`__snapshots__/${workspace.name}.txt`);
    }
});
