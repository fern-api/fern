import { compile } from "@fern-api/compiler";
import { loadWorkspaceDefinition, WorkspaceDefinition } from "@fern-api/compiler-commons";
import { runPlugin } from "@fern-api/plugin-runner";
import { rm, writeFile } from "fs/promises";
import Listr from "listr";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { handleCompilerFailure } from "./handleCompilerFailure";
import { parseFernDirectory } from "./parseFernDirectory";

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
        task: await createCompileWorkspaceSubtasks({
            workspaceDefinition,
            workspacePathRelativeToRoot:
                absolutePathToProjectConfig != null
                    ? path.relative(path.dirname(absolutePathToProjectConfig), path.dirname(pathToWorkspaceDefinition))
                    : undefined,
        }),
    };
}

async function createCompileWorkspaceSubtasks({
    workspaceDefinition,
    workspacePathRelativeToRoot,
}: {
    workspaceDefinition: WorkspaceDefinition;
    workspacePathRelativeToRoot: string | undefined;
}): Promise<() => Listr> {
    const workspaceTempDir = await tmp.dir({
        // use the /private prefix on osx so that docker can access the tmpdir
        // see https://stackoverflow.com/a/45123074
        tmpdir: os.platform() === "darwin" ? path.join("/private", os.tmpdir()) : undefined,
        prefix: "fern",
    });

    const pathToIr = path.join(workspaceTempDir.path, "ir.json");

    const listr = new Listr([
        {
            title: "Parse API definition",
            task: async () => {
                const files = await parseFernDirectory(workspaceDefinition.absolutePathToInput);
                const compileResult = await compile(files);
                if (compileResult.didSucceed) {
                    await writeFile(pathToIr, JSON.stringify(compileResult.intermediateRepresentation));
                } else {
                    handleCompilerFailure(compileResult.failure);
                }
            },
        },
        {
            title: "Run plugins",
            task: async () => {
                await Promise.all(
                    workspaceDefinition.plugins.map(async (pluginInvocation) => {
                        const configJson = await tmp.file({
                            tmpdir: workspaceTempDir.path,
                        });
                        await runPlugin({
                            pluginInvocation,
                            pathToIr,
                            pathToWriteConfigJson: configJson.path,
                            workspacePathRelativeToRoot,
                        });
                    })
                );
            },
        },
        {
            title: "Clean up",
            task: async () => {
                await rm(workspaceTempDir.path, { recursive: true });
            },
            skip: () => process.env.NODE_ENV === "development",
        },
    ]);

    return () => listr;
}
