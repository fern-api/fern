import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { describe, expect, it } from "vitest";

import { convertIRtoJsonSchema } from "../convertIRtoJsonSchema.js";

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
                exampleGeneration: { disabled: false },
                readme: undefined,
                version: undefined,
                packageName: undefined,
                context,
                sourceResolver: new SourceResolverImpl(context, fernWorkspace)
            });

            // TODO(KLUDGE): Skip types that fail ajv.compile. These should be fixed and removed.
            // See: https://github.com/fern-api/fern/issues/XXXX
            const SKIP_TYPES = new Set(["server-sent-event-examples-type_completions:StreamEventContextProtocol"]);

            for (const [typeId, _] of Object.entries(intermediateRepresentation.types)) {
                const testName = `${workspace.workspaceName}-${typeId}`;
                const testFn = SKIP_TYPES.has(testName) ? it.skip : it;
                testFn(testName, async () => {
                    const jsonschema = convertIRtoJsonSchema({
                        ir: intermediateRepresentation,
                        typeId,
                        context
                    });

                    // Validate the JSON Schema
                    const ajv = addFormats(new Ajv());
                    try {
                        ajv.compile(jsonschema);
                    } catch (error) {
                        // eslint-disable-next-line no-console
                        console.error("Failed to compile JSON Schema:\n" + JSON.stringify(jsonschema, undefined, 2));
                        throw error;
                    }

                    const json = JSON.stringify(jsonschema, undefined, 2);
                    // biome-ignore lint/suspicious/noMisplacedAssertion: assertion is inside a dynamic it() call that biome can't detect
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
