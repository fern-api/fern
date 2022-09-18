import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/core-utils";
import { DraftGeneratorInvocation } from "@fern-api/generators-configuration";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model/ir";
import { mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { runGenerator } from "./run-generator/runGenerator";

export async function runLocalGenerationForWorkspace({
    organization,
    workspace,
    intermediateRepresentation,
    keepDocker,
}: {
    organization: string;
    workspace: Workspace;
    intermediateRepresentation: IntermediateRepresentation;
    keepDocker: boolean;
}): Promise<void> {
    if (workspace.generatorsConfiguration.draft.length === 0) {
        return;
    }

    const workspaceTempDir = await tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern",
    });

    const pathToIr = join(AbsoluteFilePath.of(workspaceTempDir.path), RelativeFilePath.of("ir.json"));
    await writeFile(pathToIr, JSON.stringify(intermediateRepresentation));

    await Promise.all(
        workspace.generatorsConfiguration.draft.map(async (generatorInvocation) =>
            loadHelpersAndRunGenerator({
                organization,
                workspace,
                generatorInvocation,
                workspaceTempDir,
                pathToIr,
                keepDocker,
            })
        )
    );
}

async function loadHelpersAndRunGenerator({
    organization,
    workspace,
    generatorInvocation,
    workspaceTempDir,
    pathToIr,
    keepDocker,
}: {
    organization: string;
    workspace: Workspace;
    generatorInvocation: DraftGeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    pathToIr: AbsoluteFilePath;
    keepDocker: boolean;
}): Promise<void> {
    const configJson = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });
    const pathToWriteConfigJson = AbsoluteFilePath.of(configJson.path);

    if (generatorInvocation.pathToLocalOutput != null) {
        await rm(generatorInvocation.pathToLocalOutput, { force: true, recursive: true });
        await mkdir(generatorInvocation.pathToLocalOutput, { recursive: true });
    }

    await runGenerator({
        imageName: `${generatorInvocation.name}:${generatorInvocation.version}`,
        pathToOutput: generatorInvocation.pathToLocalOutput,
        pathToIr,
        pathToWriteConfigJson,
        customConfig: generatorInvocation.config,
        workspaceName: workspace.name,
        organization,
        keepDocker,
    });
}
