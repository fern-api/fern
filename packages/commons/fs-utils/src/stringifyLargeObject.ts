import { readFile } from "fs/promises";
import tmp from "tmp-promise";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";
import { streamObjectToFile } from "./streamObjectToFile.js";

export async function stringifyLargeObject(
    obj: unknown,
    { pretty, onWrite }: { pretty?: boolean; onWrite?: (filepath: AbsoluteFilePath) => void } = {}
): Promise<string> {
    const tmpFile = await tmp.file();
    const filepath = AbsoluteFilePath.of(tmpFile.path);
    await streamObjectToFile(filepath, obj, { pretty });
    onWrite?.(filepath);
    const fileContents = await readFile(tmpFile.path);
    return fileContents.toString();
}
