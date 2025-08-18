import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile, rm } from "fs/promises";
import { tmpName } from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli";

export interface DiffResult {
    exitCode: number;
    stdout: string;
}

export async function diff({
    fixturePath,
    fromVersion
}: {
    fixturePath: AbsoluteFilePath;
    fromVersion?: string;
}): Promise<DiffResult> {
    const fromIrFilename = await tmpName();
    await rm(fromIrFilename, { force: true, recursive: true });

    await runFernCli(["ir", fromIrFilename], {
        cwd: join(fixturePath, RelativeFilePath.of("from"))
    });

    const toIrFilename = await tmpName();
    await rm(toIrFilename, { force: true, recursive: true });

    await runFernCli(["ir", toIrFilename], {
        cwd: join(fixturePath, RelativeFilePath.of("to"))
    });

    const command = ["diff", "--from", fromIrFilename, "--to", toIrFilename];
    if (fromVersion != null) {
        command.push("--from-version", fromVersion);
    }

    const result = await runFernCli(command, {
        cwd: join(fixturePath, RelativeFilePath.of("from")),
        reject: false
    });

    return {
        exitCode: result.exitCode,
        stdout: result.stdout
    };
}
