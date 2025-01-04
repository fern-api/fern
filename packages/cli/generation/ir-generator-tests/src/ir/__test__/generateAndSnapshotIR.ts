import { writeFile } from "fs/promises";

import { SourceResolverImpl } from "@fern-api/cli-source-resolver";
import { Audiences } from "@fern-api/configuration-loader";
import { AbsoluteFilePath, RelativeFilePath, join, stringifyLargeObject } from "@fern-api/fs-utils";
import { generateIntermediateRepresentation } from "@fern-api/ir-generator";
import { serialization as IrSerialization } from "@fern-api/ir-sdk";
import { createMockTaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace, loadAPIWorkspace } from "@fern-api/workspace-loader";

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
    workspace: AbstractAPIWorkspace<unknown>;
    workspaceName: string;
    absolutePathToIr: AbsoluteFilePath;
    audiences: Audiences;
}): Promise<void> {
    const context = createMockTaskContext();
    const fernWorkspace = await workspace.toFernWorkspace({
        context
    });

    const intermediateRepresentation = generateIntermediateRepresentation({
        workspace: fernWorkspace,
        generationLanguage: undefined,
        audiences,
        keywords: undefined,
        smartCasing: true,
        disableExamples: false,
        readme: undefined,
        version: undefined,
        packageName: undefined,
        context,
        sourceResolver: new SourceResolverImpl(context, fernWorkspace)
    });

    const intermediateRepresentationJson = IrSerialization.IntermediateRepresentation.jsonOrThrow(
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
