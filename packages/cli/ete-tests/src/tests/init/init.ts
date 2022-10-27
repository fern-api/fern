import { AbsoluteFilePath } from "@fern-api/fs-utils";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";

export async function init(): Promise<AbsoluteFilePath> {
    const directory = await tmp.dir();
    const pathOfDirectory = AbsoluteFilePath.of(directory.path);
    await runFernCli(["init", "--organization", "fern"], {
        cwd: pathOfDirectory,
    });
    return pathOfDirectory;
}
