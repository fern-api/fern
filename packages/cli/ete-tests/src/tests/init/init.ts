import { AbsoluteFilePath } from "@fern-api/fs-utils";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli";

export async function init({
    directory,
    openApiArg
}: { directory?: AbsoluteFilePath; openApiArg?: string } = {}): Promise<AbsoluteFilePath> {
    if (directory == null) {
        const tmpDir = await tmp.dir();
        directory = AbsoluteFilePath.of(tmpDir.path);
    }

    const cliArgs = ["init", "--organization", "fern"];
    if (openApiArg != null) {
        cliArgs.push("--openapi", openApiArg);
        cliArgs.push("--log-level", "debug");
    }

    await runFernCli(cliArgs, {
        cwd: directory
    });
    return directory;
}
