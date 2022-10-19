import { AbsoluteFilePath, join } from "@fern-api/core-utils";
import { Language } from "@fern-api/ir-generator";
import { readFile, rm } from "fs/promises";
import { runFernCli } from "../../utils/runFernCli";

export async function generateIrAsString({
    fixturePath,
    language,
}: {
    fixturePath: AbsoluteFilePath;
    language?: Language;
}): Promise<string> {
    const irOutputPath = join(fixturePath, "ir.json");
    await rm(irOutputPath, { force: true, recursive: true });

    const command = ["ir", irOutputPath];
    if (language != null) {
        command.push("--language", language);
    }

    await runFernCli(command, {
        cwd: fixturePath,
    });

    const irContents = await readFile(irOutputPath);
    return irContents.toString();
}
