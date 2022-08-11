import { GeneratorInvocation } from "@fern-api/generators-configuration";
import { Workspace } from "@fern-api/workspace-loader";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
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
    if (workspace.generatorsConfiguration.generators.length === 0) {
        return;
    }

    const workspaceTempDir = await tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern",
    });

    const absolutePathToIr = path.join(workspaceTempDir.path, "ir.json");
    await writeFile(absolutePathToIr, JSON.stringify(intermediateRepresentation));

    await Promise.all(
        workspace.generatorsConfiguration.generators.map(async (generatorInvocation) =>
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
    generatorInvocation: GeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    absolutePathToIr: string;
    keepDocker: boolean;
}): Promise<void> {
    const configJson = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });

    if (generatorInvocation.generate?.absolutePathToLocalOutput != null) {
        await rm(generatorInvocation.generate.absolutePathToLocalOutput, { force: true, recursive: true });
        await mkdir(generatorInvocation.generate.absolutePathToLocalOutput, { recursive: true });
    }

    await runGenerator({
        imageName: `${generatorInvocation.name}:${generatorInvocation.version}`,
        absolutePathToOutput: generatorInvocation.generate?.absolutePathToLocalOutput,
        absolutePathToIr,
        pathToWriteConfigJson: configJson.path,
        customConfig: generatorInvocation.config,
        workspaceName: workspace.name,
        organization,
        keepDocker,
    });
}
