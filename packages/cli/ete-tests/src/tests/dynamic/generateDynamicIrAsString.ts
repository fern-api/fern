import { readFile, rm } from "fs/promises";

import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { runFernCli } from "../../utils/runFernCli";

export async function generateDynamicIrAsString({
    fixturePath,
    language,
    audiences,
    apiName,
    version
}: {
    fixturePath: AbsoluteFilePath;
    language?: generatorsYml.GenerationLanguage;
    audiences?: string[];
    apiName?: string;
    version?: string;
}): Promise<string> {
    const dynamicOutputPath = join(fixturePath, RelativeFilePath.of("dynamic.json"));
    await rm(dynamicOutputPath, { force: true, recursive: true });

    const command = ["dynamic-ir", dynamicOutputPath];
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

    await runFernCli(command, {
        cwd: fixturePath
    });

    const dynamicContents = await readFile(dynamicOutputPath);
    return dynamicContents.toString();
}
