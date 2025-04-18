import tmp from "tmp-promise";

import { AbsoluteFilePath } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

interface InitOptions {
    directory?: AbsoluteFilePath;
    additionalArgs?: {
        name: "--openapi" | "--mintlify" | "--log-level";
        value: string;
    }[];
}

export async function init(options: InitOptions = {}): Promise<AbsoluteFilePath> {
    let directory = options.directory;
    if (directory == null) {
        const tmpDir = await tmp.dir();
        directory = AbsoluteFilePath.of(tmpDir.path);
    }

    const cliArgs = ["init", "--organization", "fern"];

    for (const additionalArg of options.additionalArgs ?? []) {
        cliArgs.push(additionalArg.name, additionalArg.value);
    }

    await runFernCli(cliArgs, {
        cwd: directory
    });
    return directory;
}
