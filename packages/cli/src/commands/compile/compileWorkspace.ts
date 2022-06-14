import { CustomWireMessageEncoding } from "@fern-api/api";
import { GeneratorInvocation, loadWorkspaceDefinition, WorkspaceDefinition } from "@fern-api/commons";
import { compile, Compiler } from "@fern-api/compiler";
import { runGenerator } from "@fern-api/generator-runner";
import { rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { buildGeneratorHelpers } from "./buildGeneratorHelpers";
import { downloadHelper } from "./downloadHelper";
import { handleCompilerFailure } from "./handleCompilerFailure";
import { parseFernInput } from "./parseFernInput";

export async function compileWorkspace({
    absolutePathToWorkspaceDefinition,
    absolutePathToProjectConfig,
}: {
    absolutePathToWorkspaceDefinition: string;
    absolutePathToProjectConfig: string | undefined;
}): Promise<void> {
    const workspaceDefinition = await loadWorkspaceDefinition(absolutePathToWorkspaceDefinition);

    const files = await parseFernInput(workspaceDefinition.absolutePathToDefinition);
    const compileResult = await compile(files, workspaceDefinition.name);
    if (!compileResult.didSucceed) {
        handleCompilerFailure(compileResult.failure);
        return;
    }

    await runGenerators({
        workspaceDefinition,
        absolutePathToProjectConfig,
        compileResult,
    });
}

async function runGenerators({
    workspaceDefinition,
    absolutePathToProjectConfig,
    compileResult,
}: {
    workspaceDefinition: WorkspaceDefinition;
    absolutePathToProjectConfig: string | undefined;
    compileResult: Compiler.SuccessfulResult;
}): Promise<void> {
    if (workspaceDefinition.generators.length === 0) {
        return;
    }

    const workspaceTempDir = await tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern",
    });

    const absolutePathToIr = path.join(workspaceTempDir.path, "ir.json");
    await writeFile(absolutePathToIr, JSON.stringify(compileResult.intermediateRepresentation));

    await Promise.all(
        workspaceDefinition.generators.map(async (generatorInvocation) =>
            loadHelpersAndRunGenerator({
                generatorInvocation,
                workspaceTempDir,
                absolutePathToIr,
                absolutePathToProjectConfig,
                nonStandardEncodings: compileResult.nonStandardEncodings,
            })
        )
    );
}

async function loadHelpersAndRunGenerator({
    generatorInvocation,
    workspaceTempDir,
    absolutePathToIr,
    absolutePathToProjectConfig,
    nonStandardEncodings,
}: {
    generatorInvocation: GeneratorInvocation;
    workspaceTempDir: DirectoryResult;
    absolutePathToIr: string;
    absolutePathToProjectConfig: string | undefined;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): Promise<void> {
    const configJson = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });

    if (generatorInvocation.absolutePathToOutput != null) {
        await rm(generatorInvocation.absolutePathToOutput, { force: true, recursive: true });
    }

    await Promise.all(
        generatorInvocation.helpers.map((helper) =>
            downloadHelper({ helper, absolutePathToWorkspaceTempDir: workspaceTempDir.path })
        )
    );

    await runGenerator({
        imageName: `${generatorInvocation.name}:${generatorInvocation.version}`,
        absolutePathToOutput: generatorInvocation.absolutePathToOutput,
        absolutePathToIr,
        pathToWriteConfigJson: configJson.path,
        helpers: buildGeneratorHelpers({
            generatorInvocation,
            nonStandardEncodings,
            absolutePathToWorkspaceTempDir: workspaceTempDir.path,
        }),
        absolutePathToProject:
            absolutePathToProjectConfig != null ? path.dirname(absolutePathToProjectConfig) : undefined,
        customConfig: generatorInvocation.config,
        workspaceVersion: "0.1.2",
    });
}
