import { GeneratorInvocation, WorkspaceConfiguration } from "@fern-api/workspace-configuration";
import { IntermediateRepresentation } from "@fern-fern/ir-model";
import { CustomWireMessageEncoding } from "@fern-fern/ir-model/services";
import { mkdir, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { buildGeneratorHelpers } from "./buildGeneratorHelpers";
import { downloadHelper } from "./downloadHelper";
import { runGenerator } from "./run-generator/runGenerator";

export async function runLocalGenerationForWorkspace({
    organization,
    workspaceConfiguration,
    intermediateRepresentation,
    keepDocker,
}: {
    organization: string;
    workspaceConfiguration: WorkspaceConfiguration;
    intermediateRepresentation: IntermediateRepresentation;
    keepDocker: boolean;
}): Promise<void> {
    if (workspaceConfiguration.generators.length === 0) {
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
        workspaceConfiguration.generators.map(async (generatorInvocation) =>
            loadHelpersAndRunGenerator({
                organization,
                workspaceConfiguration,
                generatorInvocation,
                workspaceTempDir,
                absolutePathToIr,
                nonStandardEncodings: intermediateRepresentation.services.nonStandardEncodings,
                keepDocker,
            })
        )
    );
}

async function loadHelpersAndRunGenerator({
    organization,
    workspaceConfiguration,
    generatorInvocation,
    workspaceTempDir,
    absolutePathToIr,
    nonStandardEncodings,
    keepDocker,
}: {
    organization: string;
    workspaceConfiguration: WorkspaceConfiguration;
    generatorInvocation: GeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    absolutePathToIr: string;
    nonStandardEncodings: CustomWireMessageEncoding[];
    keepDocker: boolean;
}): Promise<void> {
    const configJson = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });

    if (generatorInvocation.generate?.absolutePathToLocalOutput != null) {
        await rm(generatorInvocation.generate.absolutePathToLocalOutput, { force: true, recursive: true });
        await mkdir(generatorInvocation.generate.absolutePathToLocalOutput, { recursive: true });
    }

    await Promise.all(
        generatorInvocation.helpers.map((helper) =>
            downloadHelper({ helper, absolutePathToWorkspaceTempDir: workspaceTempDir.path })
        )
    );

    await runGenerator({
        imageName: `${generatorInvocation.name}:${generatorInvocation.version}`,
        absolutePathToOutput: generatorInvocation.generate?.absolutePathToLocalOutput,
        absolutePathToIr,
        pathToWriteConfigJson: configJson.path,
        helpers: buildGeneratorHelpers({
            generatorInvocation,
            nonStandardEncodings,
            absolutePathToWorkspaceTempDir: workspaceTempDir.path,
        }),
        customConfig: generatorInvocation.config,
        workspaceName: workspaceConfiguration.name,
        organization,
        keepDocker,
    });
}
