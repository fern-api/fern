import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { readFile, rm } from "fs/promises";
import { runFernCli } from "../../utils/runFernCli";

export async function generateIrAsString({
    fixturePath,
    language,
    audiences,
    apiName,
}: {
    fixturePath: AbsoluteFilePath;
    language?: GenerationLanguage;
    audiences?: string[];
    apiName?: string;
}): Promise<string> {
    const irOutputPath = join(fixturePath, "ir.json");
    await rm(irOutputPath, { force: true, recursive: true });

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

    await runFernCli(command, {
        cwd: fixturePath,
    });

    const irContents = await readFile(irOutputPath);
    return irContents.toString();
}
