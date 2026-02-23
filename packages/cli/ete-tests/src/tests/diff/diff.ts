import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { rm } from "fs/promises";
import { tmpName } from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

export interface DiffResult {
    exitCode: number;
    stdout: string;
}

export async function diff({
    fixturePath,
    fromVersion,
    signal
}: {
    fixturePath: AbsoluteFilePath;
    fromVersion?: string;
    signal?: AbortSignal;
}): Promise<DiffResult> {
    const fromIrFilename = await tmpName();
    await rm(fromIrFilename, { force: true, recursive: true });

    await runFernCli(["ir", fromIrFilename], { cwd: join(fixturePath, RelativeFilePath.of("from")), signal });

    const toIrFilename = await tmpName();
    await rm(toIrFilename, { force: true, recursive: true });

    await runFernCli(["ir", toIrFilename], { cwd: join(fixturePath, RelativeFilePath.of("to")), signal });

    const command = ["diff", "--from", fromIrFilename, "--to", toIrFilename];
    if (fromVersion != null) {
        command.push("--from-version", fromVersion);
    }

    const result = await runFernCli(command, {
        cwd: join(fixturePath, RelativeFilePath.of("from")),
        reject: false,
        signal
    });

    return {
        exitCode: result.exitCode,
        stdout: result.stdout
    };
}
