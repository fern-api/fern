import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

export async function runScript({
    commands,
    workingDir,
    logger,
    doNotPipeOutput
}: {
    commands: string[];
    workingDir: string;
    logger: Logger;
    doNotPipeOutput: boolean;
}): Promise<void> {
    const scriptFile = await tmp.file();
    await writeFile(scriptFile.path, [`cd ${workingDir}`, ...commands].join("\n"));
    await loggingExeca(logger, "bash", [scriptFile.path], {
        doNotPipeOutput
    });
}
