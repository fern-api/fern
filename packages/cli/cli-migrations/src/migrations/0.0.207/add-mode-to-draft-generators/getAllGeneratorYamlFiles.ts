import { FERN_DIRECTORY, findFernDirectory } from "@fern-api/configuration-loader";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { glob } from "glob";

export async function getAllGeneratorYamlFiles(context: TaskContext): Promise<AbsoluteFilePath[]> {
    const fernDirectory = await findFernDirectory();
    const alphasort = (a: string, b: string) => a.localeCompare(b, "en");
    if (fernDirectory == null) {
        context.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`);
    }
    const filepaths = await glob("*/generators.yml", {
        cwd: fernDirectory,
        absolute: true
    });
    return filepaths.map(AbsoluteFilePath.of);
}
