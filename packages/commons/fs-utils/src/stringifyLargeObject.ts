import { readFile } from "fs/promises";
import tmp from "tmp-promise";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import { streamObjectToFile } from "./streamObjectToFile";

export async function stringifyLargeObject(obj: unknown, { pretty }: { pretty?: boolean } = {}): Promise<string> {
    const tmpFile = await tmp.file();
    await streamObjectToFile(AbsoluteFilePath.of(tmpFile.path), obj, { pretty });
    const fileContents = await readFile(tmpFile.path);
    return fileContents.toString();
}
