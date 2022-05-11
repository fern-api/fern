import { CustomWireMessageEncoding } from "@fern-api/api";
import { compile, Compiler } from "@fern-api/compiler";
import { loadWorkspaceDefinition, PluginInvocation, WorkspaceDefinition } from "@fern-api/compiler-commons";
import { runPlugin } from "@fern-api/plugin-runner";
import { writeFile } from "fs/promises";
import os from "os";
import path from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { buildPluginHelpers } from "./buildPluginHelpers";
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

    const files = await parseFernInput(workspaceDefinition.absolutePathToInput);
    const compileResult = await compile(files, workspaceDefinition.name);
    if (!compileResult.didSucceed) {
        handleCompilerFailure(compileResult.failure);
        return;
    }

    await runPlugins({
        workspaceDefinition,
        absolutePathToProjectConfig,
        compileResult,
    });
}

async function runPlugins({
    workspaceDefinition,
    absolutePathToProjectConfig,
    compileResult,
}: {
    workspaceDefinition: WorkspaceDefinition;
    absolutePathToProjectConfig: string | undefined;
    compileResult: Compiler.SuccessfulResult;
}): Promise<void> {
    if (workspaceDefinition.plugins.length === 0) {
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
        workspaceDefinition.plugins.map(async (pluginInvocation) =>
            loadHelpersAndRunPlugin({
                pluginInvocation,
                workspaceTempDir,
                absolutePathToIr,
                absolutePathToProjectConfig,
                nonStandardEncodings: compileResult.nonStandardEncodings,
            })
        )
    );
}

async function loadHelpersAndRunPlugin({
    pluginInvocation,
    workspaceTempDir,
    absolutePathToIr,
    absolutePathToProjectConfig,
    nonStandardEncodings,
}: {
    pluginInvocation: PluginInvocation;
    workspaceTempDir: DirectoryResult;
    absolutePathToIr: string;
    absolutePathToProjectConfig: string | undefined;
    nonStandardEncodings: CustomWireMessageEncoding[];
}): Promise<void> {
    const configJson = await tmp.file({
        tmpdir: workspaceTempDir.path,
    });

    await runPlugin({
        imageName: `${pluginInvocation.name}:${pluginInvocation.version}`,
        absolutePathToOutput: pluginInvocation.absolutePathToOutput,
        absolutePathToIr,
        pathToWriteConfigJson: configJson.path,
        pluginHelpers: buildPluginHelpers({ pluginInvocation, nonStandardEncodings }),
        absolutePathToProject:
            absolutePathToProjectConfig != null ? path.dirname(absolutePathToProjectConfig) : undefined,
        customConfig: pluginInvocation.config,
    });
}
