import { compile, Compiler } from "@fern-api/compiler";
import { loadWorkspaceDefinition, PluginInvocation, WorkspaceDefinition } from "@fern-api/compiler-commons";
import { runPlugin } from "@fern-api/plugin-runner";
import { writeFile } from "fs/promises";
import Listr from "listr";
import os from "os";
import path from "path";
import tmp, { DirectoryResult } from "tmp-promise";
import { handleCompilerFailure } from "./handleCompilerFailure";
import { parseFernDirectory } from "./parseFernDirectory";

interface CompileWorkspaceContext {
    compileResult: Compiler.SuccessfulResult | undefined;
}

export async function createCompileWorkspaceTask({
    pathToWorkspaceDefinition,
    absolutePathToProjectConfig,
}: {
    pathToWorkspaceDefinition: string;
    absolutePathToProjectConfig: string | undefined;
}): Promise<Listr.ListrTask> {
    const workspaceDefinition = await loadWorkspaceDefinition(pathToWorkspaceDefinition);
    return {
        title: workspaceDefinition.name ?? pathToWorkspaceDefinition,
        task: () =>
            createCompileWorkspaceSubtasks({
                workspaceDefinition,
                absolutePathToProjectConfig,
            }),
    };
}

async function createCompileWorkspaceSubtasks({
    workspaceDefinition,
    absolutePathToProjectConfig,
}: {
    workspaceDefinition: WorkspaceDefinition;
    absolutePathToProjectConfig: string | undefined;
}): Promise<Listr> {
    const listr = new Listr<CompileWorkspaceContext>([
        {
            title: "Parse fern definition",
            task: async (context) => {
                const files = await parseFernDirectory(workspaceDefinition.absolutePathToInput);
                const compileResult = await compile(files);

                if (!compileResult.didSucceed) {
                    handleCompilerFailure(compileResult.failure);
                    throw new Error();
                }

                context.compileResult = compileResult;
            },
        },
        {
            title: "Run plugins",
            task: (context) =>
                createPluginSubtasks({
                    workspaceDefinition,
                    absolutePathToProjectConfig,
                    context,
                }),
        },
    ]);

    return listr;
}

async function createPluginSubtasks({
    workspaceDefinition,
    absolutePathToProjectConfig,
    context,
}: {
    workspaceDefinition: WorkspaceDefinition;
    absolutePathToProjectConfig: string | undefined;
    context: CompileWorkspaceContext;
}): Promise<Listr> {
    if (context.compileResult == null) {
        throw new Error("Cannot create plugin subtasks because context.compileResult is not defined.");
    }

    const workspaceTempDir = await tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern",
    });

    const absolutePathToIr = path.join(workspaceTempDir.path, "ir.json");
    await writeFile(absolutePathToIr, JSON.stringify(context.compileResult.intermediateRepresentation));

    const tasks = workspaceDefinition.plugins.map((pluginInvocation) =>
        createPluginSubtask({ pluginInvocation, workspaceTempDir, absolutePathToIr, absolutePathToProjectConfig })
    );
    return new Listr<CompileWorkspaceContext>(tasks, {
        concurrent: true,
    });
}

function createPluginSubtask({
    pluginInvocation,
    workspaceTempDir,
    absolutePathToIr,
    absolutePathToProjectConfig,
}: {
    pluginInvocation: PluginInvocation;
    workspaceTempDir: DirectoryResult;
    absolutePathToIr: string;
    absolutePathToProjectConfig: string | undefined;
}): Listr.ListrTask {
    return {
        title: pluginInvocation.name,
        task: async () => {
            // TODO get helpers for each non-standard encoding

            const configJson = await tmp.file({
                tmpdir: workspaceTempDir.path,
            });

            await runPlugin({
                pluginInvocation,
                absolutePathToIr,
                pathToWriteConfigJson: configJson.path,
                absolutePathToProjectConfig,
            });
        },
    };
}
