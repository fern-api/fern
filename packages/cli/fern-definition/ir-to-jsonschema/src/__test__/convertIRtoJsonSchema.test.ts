import Ajv from "ajv";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";

import { convertIRtoJsonSchema } from "../convertIRtoJsonSchema";

describe("convertIRtoJsonSchema", async () => {
    const TEST_DEFINITIONS_DIR = join(
        AbsoluteFilePath.of(__dirname),
        RelativeFilePath.of("../../../../../../test-definitions")
    );
    const apiWorkspaces = await loadApis({
        fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    const context = createMockTaskContext();

    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            const fernWorkspace = await workspace.toFernWorkspace({
                context
            });

            const intermediateRepresentation = generateIntermediateRepresentation({
                workspace: fernWorkspace,
                generationLanguage: undefined,
                audiences: { type: "all" },
                keywords: undefined,
                smartCasing: true,
                disableExamples: false,
                readme: undefined,
                version: undefined,
                packageName: undefined,
                context,
                sourceResolver: new SourceResolverImpl(context, fernWorkspace)
            });

            for (const [typeId, _] of Object.entries(intermediateRepresentation.types)) {
                it(`${workspace.workspaceName}-${typeId}`, async () => {
                    const jsonschema = convertIRtoJsonSchema({
                        ir: intermediateRepresentation,
                        typeId,
                        context
                    });

                    // Validate the JSON Schema
                    const ajv = addFormats(new Ajv());
                    ajv.compile(jsonschema);

                    const json = JSON.stringify(jsonschema, undefined, 2);
                    // eslint-disable-next-line jest/no-standalone-expect
                    await expect(json).toMatchFileSnapshot(
                        RelativeFilePath.of(
                            `./__snapshots__/${workspace.workspaceName}/${typeId.replaceAll(":", "_")}.json`
                        )
                    );
                });
            }
        })
    );
});
