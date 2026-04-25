import { writeFile } from "fs/promises";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";

export async function streamObjectToFile(
    filepath: AbsoluteFilePath,
    obj: unknown,
    { pretty = false }: { pretty?: boolean } = {}
): Promise<void> {
    const json = JSON.stringify(obj, undefined, pretty ? 4 : undefined);
    await writeFile(filepath, json);
}
