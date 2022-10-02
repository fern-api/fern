import { AbsoluteFilePath, join } from "@fern-api/core-utils";
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

    const absolutePathToIr = join(AbsoluteFilePath.of(workspaceTempDir.path), "ir.json");
    await writeFile(absolutePathToIr, JSON.stringify(intermediateRepresentation));

    await Promise.all(
        workspace.generatorsConfiguration.draft.map(async (generatorInvocation) =>
            loadHelpersAndRunGenerator({
                organization,
                workspace,
                generatorInvocation,
                workspaceTempDir,
                absolutePathToIr,
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
    absolutePathToIr,
    keepDocker,
}: {
    organization: string;
    workspace: Workspace;
    generatorInvocation: DraftGeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    absolutePathToIr: AbsoluteFilePath;
    keepDocker: boolean;
}): Promise<void> {
    const configJson = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });
    const absolutePathToWriteConfigJson = AbsoluteFilePath.of(configJson.path);

    if (generatorInvocation.absolutePathToLocalOutput != null) {
        await rm(generatorInvocation.absolutePathToLocalOutput, { force: true, recursive: true });
        await mkdir(generatorInvocation.absolutePathToLocalOutput, { recursive: true });
    }

    await runGenerator({
        imageName: `${generatorInvocation.name}:${generatorInvocation.version}`,
        absolutePathToOutput: generatorInvocation.absolutePathToLocalOutput,
        absolutePathToIr,
        absolutePathToWriteConfigJson,
        customConfig: generatorInvocation.config,
        workspaceName: workspace.name,
        organization,
        keepDocker,
    });
}
