import { createWriteStream } from "fs";
import { readFile } from "fs/promises";
import { JsonStreamStringify } from "json-stream-stringify";
import tmp from "tmp-promise";

export async function stringifyLargeObject(
    obj: unknown,
    { pretty = false }: { pretty?: boolean } = {}
): Promise<string> {
    const tmpFile = await tmp.file();
    const stream = new JsonStreamStringify(obj, undefined, pretty ? 4 : undefined);
    return new Promise((resolve, reject) => {
        stream
            .pipe(createWriteStream(tmpFile.path))
            .on("error", reject)
            .on("finish", () => {
                resolve(readFile(tmpFile.path).then((contents) => contents.toString()));
            });
    });
}
