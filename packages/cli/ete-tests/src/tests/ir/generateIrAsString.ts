import { AbsoluteFilePath, join } from "@fern-api/fs-utils";
import { Language } from "@fern-api/ir-generator";
import { readFile, rm } from "fs/promises";
import { runFernCli } from "../../utils/runFernCli";

export async function generateIrAsString({
    fixturePath,
    language,
    audiences,
}: {
    fixturePath: AbsoluteFilePath;
    language?: Language;
    audiences?: string[];
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

    await runFernCli(command, {
        cwd: fixturePath,
    });

    const irContents = await readFile(irOutputPath);
    return irContents.toString();
}
