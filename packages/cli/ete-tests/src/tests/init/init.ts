import { AbsoluteFilePath } from "@fern-api/core-utils";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";

export async function init({ directory }: { directory?: AbsoluteFilePath } = {}): Promise<AbsoluteFilePath> {
    if (directory == null) {
        const tmpDir = await tmp.dir();
        directory = AbsoluteFilePath.of(tmpDir.path);
    }
    await runFernCli(["init", "--organization", "fern"], {
        cwd: directory,
    });
    return directory;
}
