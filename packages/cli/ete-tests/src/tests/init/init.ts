import { AbsoluteFilePath } from "@fern-api/fs-utils";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

interface InitOptions {
    directory?: AbsoluteFilePath;
    additionalArgs?: {
        name: "--openapi" | "--mintlify" | "--log-level" | "--fern-definition";
        value?: string;
    }[];
    signal?: AbortSignal;
}

export async function init(options: InitOptions = {}): Promise<AbsoluteFilePath> {
    let directory = options.directory;
    if (directory == null) {
        const tmpDir = await tmp.dir();
        directory = AbsoluteFilePath.of(tmpDir.path);
    }

    const cliArgs = ["init", "--organization", "fern"];

    for (const additionalArg of options.additionalArgs ?? []) {
        cliArgs.push(additionalArg.name);
        if (additionalArg.value != null) {
            cliArgs.push(additionalArg.value);
        }
    }

    await runFernCli(cliArgs, { cwd: directory, signal: options.signal });
    return directory;
}
