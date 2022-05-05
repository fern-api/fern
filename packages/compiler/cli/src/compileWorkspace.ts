import { compile } from "@fern-api/compiler";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import Listr from "listr";
import path from "path";
import tmp from "tmp-promise";
import { handleCompilerFailure } from "./handleCompilerFailure";
import { parseFernDirectory } from "./parseFernDirectory";

export async function createCompileWorkspaceTask(pathToWorkspaceDefinition: string): Promise<Listr.ListrTask> {
    const fileContents = await readFile(pathToWorkspaceDefinition);
    const parsed = yaml.load(fileContents.toString()) as any;
    const subtasks = await createCompileWorkspaceSubtasks({
        inputDirectory: path.join(path.dirname(pathToWorkspaceDefinition), parsed.input),
    });
    return {
        title: parsed.name,
        task: () => subtasks,
    };
}

async function createCompileWorkspaceSubtasks({ inputDirectory }: { inputDirectory: string }): Promise<Listr> {
    const tempIrFile = await tmp.file();
    return new Listr([
        {
            title: "Parse API definition",
            task: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10_000));
                const files = await parseFernDirectory(inputDirectory);
                const compileResult = await compile(files);
                if (compileResult.didSucceed) {
                    await writeFile(tempIrFile.path, JSON.stringify(compileResult.intermediateRepresentation));
                } else {
                    handleCompilerFailure(compileResult.failure);
                }
            },
        },
        {
            title: "Run plugins",
            task: async () => {
                await new Promise((resolve) => setTimeout(resolve, 10_000));
            },
        },
        {
            title: "Clean up",
            task: async () => {
                await tempIrFile.cleanup();
            },
        },
    ]);
}
