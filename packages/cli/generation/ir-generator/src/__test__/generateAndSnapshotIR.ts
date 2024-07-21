import { Audiences } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath, stringifyLargeObject } from "@fern-api/fs-utils";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { APIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";
import { writeFile } from "fs/promises";
import { generateIntermediateRepresentation } from "../generateIntermediateRepresentation";

export async function generateAndSnapshotIRFromPath({
    absolutePathToWorkspace,
    workspaceName,
    audiences,
    absolutePathToIr
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    workspaceName: string;
    absolutePathToIr: AbsoluteFilePath;
    audiences: Audiences;
}): Promise<void> {
    // Test for audiences
    const context = createMockTaskContext();
    const workspace = await loadAPIWorkspace({
        absolutePathToWorkspace,
        context,
        cliVersion: "0.0.0",
        workspaceName
    });
    if (!workspace.didSucceed) {
        throw new Error(`Failed to load workspace: ${JSON.stringify(workspace.failures)}`);
    }
    await generateAndSnapshotIR({ workspace: workspace.workspace, workspaceName, audiences, absolutePathToIr });
}

export async function generateAndSnapshotIR({
    workspace,
    workspaceName,
    audiences,
    absolutePathToIr
}: {
    workspace: APIWorkspace;
    workspaceName: string;
    absolutePathToIr: AbsoluteFilePath;
    audiences: Audiences;
}): Promise<void> {
    const context = createMockTaskContext();
    const fernWorkspace = await workspace.toFernWorkspace({
        context
    });

    const intermediateRepresentation = await generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences,
        keywords: undefined,
        smartCasing: true,
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
        join(AbsoluteFilePath.of(absolutePathToIr), RelativeFilePath.of(`${workspaceName}.json`)),
        await stringifyLargeObject(intermediateRepresentationJson, { pretty: true })
    );
}
