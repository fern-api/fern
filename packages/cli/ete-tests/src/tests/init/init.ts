import { AbsoluteFilePath } from "@fern-api/core-utils";
import { runFernCli } from "../../utils/runFernCli";

export async function init(cwd: AbsoluteFilePath): Promise<void> {
    await runFernCli(["init", "--organization", "fern"], {
        cwd,
    });
}
