import { compile } from "@fern-api/compiler";
import { runPlugin } from "@fern-api/plugin-runner";
import { readFile, rm, writeFile } from "fs/promises";
import yaml from "js-yaml";
import Listr from "listr";
import os from "os";
import path from "path";
import tmp from "tmp-promise";
import { handleCompilerFailure } from "./handleCompilerFailure";
import { parseFernDirectory } from "./parseFernDirectory";

interface WorkspaceConfig {
    name?: string;
    input: string;
    plugins: { name: string; output: string; config: unknown }[];
}

export async function createCompileWorkspaceTask({
    pathToWorkspaceDefinition,
    absolutePathToProjectConfig,
}: {
    pathToWorkspaceDefinition: string;
    absolutePathToProjectConfig: string | undefined;
}): Promise<Listr.ListrTask> {
    const fileContents = await readFile(pathToWorkspaceDefinition);
    const workspaceConfig = yaml.load(fileContents.toString()) as WorkspaceConfig;
    const workspacePathRelativeToRoot = getWorkspacePathRelativeToRoot(
        absolutePathToProjectConfig,
        pathToWorkspaceDefinition
    );
    return {
        title: workspaceConfig.name ?? pathToWorkspaceDefinition,
        task: await createCompileWorkspaceSubtasks({
            pathToWorkspaceDefinition,
            workspaceConfig,
            workspacePathRelativeToRoot,
        }),
    };
}

async function createCompileWorkspaceSubtasks({
    pathToWorkspaceDefinition,
    workspaceConfig,
    workspacePathRelativeToRoot,
}: {
    pathToWorkspaceDefinition: string;
    workspaceConfig: WorkspaceConfig;
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
                const files = await parseFernDirectory(
                    path.join(path.dirname(pathToWorkspaceDefinition), workspaceConfig.input)
                );
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
                    workspaceConfig.plugins.map(async (plugin) => {
                        const configJson = await tmp.file({
                            tmpdir: workspaceTempDir.path,
                        });
                        await runPlugin({
                            imageName: plugin.name,
                            pathToIr,
                            pathToWriteConfigJson: configJson.path,
                            pluginConfig: plugin.config,
                            pluginOutputDirectory: path.join(path.dirname(pathToWorkspaceDefinition), plugin.output),
                            workspacePathRelativeToRoot: workspacePathRelativeToRoot,
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

function getWorkspacePathRelativeToRoot(
    absolutePathToProjectConfig: string | undefined,
    pathToWorkspaceDefinition: string
): string | undefined {
    if (absolutePathToProjectConfig != null) {
        return path.relative(path.dirname(absolutePathToProjectConfig), path.dirname(pathToWorkspaceDefinition));
    }
    return undefined;
}
