/* eslint-disable jest/valid-describe-callback */
/* eslint-disable jest/valid-title */
/* eslint-disable @typescript-eslint/no-misused-promises */

import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { loadApis } from "@fern-api/project-loader";
import { createMockTaskContext } from "@fern-api/task-context";
import path from "path";
import { convertIrToFdrApi } from "../convertIrToFdrApi";

describe("fdr test definitions", async () => {
    const TEST_DEFINITIONS_DIR = path.join(__dirname, "../../../../../../test-definitions");
    const apiWorkspaces = await loadApis({
        fernDirectory: join(AbsoluteFilePath.of(TEST_DEFINITIONS_DIR), RelativeFilePath.of("fern")),
        context: createMockTaskContext(),
        cliVersion: "0.0.0",
        cliName: "fern",
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    await Promise.all(
        apiWorkspaces.map(async (workspace) => {
            const context = createMockTaskContext();
            const fernWorkspace = await workspace.toFernWorkspace({
                context
            });

            const ir = await generateIntermediateRepresentation({
                workspace: fernWorkspace,
                generationLanguage: undefined,
                audiences: { type: "all" },
                keywords: undefined,
                smartCasing: true,
                disableExamples: false,
                readme: undefined,
                version: undefined,
                packageName: undefined,
                taskContext: context
            });

            const fdr = convertIrToFdrApi({ ir, snippetsConfig: {} });

            it(workspace.workspaceName ?? "", () => {
                expect(fdr).toMatchSnapshot();
            });
        })
    );
});
