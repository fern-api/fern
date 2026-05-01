import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import { writeFile } from "fs/promises";
import tmp from "tmp-promise";

export async function runScript({
    commands,
    workingDir,
    logger,
    doNotPipeOutput,
    env
}: {
    commands: string[];
    workingDir: string;
    logger?: Logger;
    doNotPipeOutput: boolean;
    env?: Record<string, string>;
}): Promise<loggingExeca.ReturnValue> {
    const scriptFile = await tmp.file();
    await writeFile(scriptFile.path, ["set -euo pipefail", `cd ${workingDir}`, ...commands].join("\n"));
    return await loggingExeca(logger, "bash", [scriptFile.path], {
        doNotPipeOutput,
        reject: false,
        env: {
            ...process.env,
            ...env
        }
    });
}
