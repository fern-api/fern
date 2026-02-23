import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import { runFernCli } from "../../utils/runFernCli.js";

export async function generateIrAsString({
    fixturePath,
    language,
    audiences,
    apiName,
    version,
    signal
}: {
    fixturePath: AbsoluteFilePath;
    language?: generatorsYml.GenerationLanguage;
    audiences?: string[];
    apiName?: string;
    version?: string;
    signal?: AbortSignal;
}): Promise<string> {
    const tmpFile = await tmp.file({ postfix: ".json" });
    const irOutputPath = AbsoluteFilePath.of(tmpFile.path);

    const command = ["ir", irOutputPath];
    if (language != null) {
        command.push("--language", language);
    }
    if (audiences != null) {
        command.push("--audience");
        for (const audience of audiences) {
            command.push(audience);
        }
    }
    if (apiName != null) {
        command.push("--api", apiName);
    }
    if (version != null) {
        command.push("--version", version);
    }

    await runFernCli(command, { cwd: fixturePath, signal });

    const irContents = await readFile(irOutputPath);
    await tmpFile.cleanup();
    return irContents.toString();
}
