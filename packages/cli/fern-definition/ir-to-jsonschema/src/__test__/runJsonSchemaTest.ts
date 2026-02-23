import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import path from "path";
import { expect } from "vitest";

import { convertIRtoJsonSchema } from "../convertIRtoJsonSchema.js";

const REPO_ROOT = path.resolve(__dirname, "../../../../../../");
const SNAPSHOT_DIR = path.resolve(__dirname, "__snapshots__");

export async function runJsonSchemaTest({ fixtureName }: { fixtureName: string }): Promise<void> {
    const fernDirectory = join(
        AbsoluteFilePath.of(path.join(REPO_ROOT, "test-definitions")),
        RelativeFilePath.of("fern")
    );
    const context = createMockTaskContext();
    const apiWorkspaces = await loadApis({
        fernDirectory,
        context,
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: fixtureName,
        defaultToAllApiWorkspaces: false
    });
    if (apiWorkspaces.length === 0) {
        throw new Error(`No workspace found for fixture ${fixtureName}`);
    }
    const workspace = apiWorkspaces[0];

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

    for (const [typeId, _] of Object.entries(intermediateRepresentation.types)) {
        const jsonschema = convertIRtoJsonSchema({
            ir: intermediateRepresentation,
            typeId,
            context
        });

        // Validate the JSON Schema
        const ajv = addFormats(new Ajv());
        ajv.compile(jsonschema);

        const json = JSON.stringify(jsonschema, undefined, 2);
        // biome-ignore lint/suspicious/noMisplacedAssertion: called from within it() in generated test files
        await expect(json).toMatchFileSnapshot(
            path.resolve(SNAPSHOT_DIR, fixtureName, `${typeId.replaceAll(":", "_")}.json`)
        );
    }
}
