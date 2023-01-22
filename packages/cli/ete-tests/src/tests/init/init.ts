import { AbsoluteFilePath } from "@fern-api/fs-utils";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";

export async function init({
    directory,
    openApiPath,
}: { directory?: AbsoluteFilePath; openApiPath?: string } = {}): Promise<AbsoluteFilePath> {
    if (directory == null) {
        const tmpDir = await tmp.dir();
        directory = AbsoluteFilePath.of(tmpDir.path);
    }

    const cliArgs = ["init", "--organization", "fern"];
    if (openApiPath != null) {
        cliArgs.push("--openapi", openApiPath);
        cliArgs.push("--log-level", "error");
    }

    await runFernCli(cliArgs, {
        cwd: directory,
    });
    return directory;
}
