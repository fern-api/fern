import { createWriteStream } from "fs";
import { JsonStreamStringify } from "json-stream-stringify";

import { AbsoluteFilePath } from "./AbsoluteFilePath";

export async function streamObjectToFile(
    filepath: AbsoluteFilePath,
    obj: unknown,
    { pretty = false }: { pretty?: boolean } = {}
): Promise<void> {
    const stream = new JsonStreamStringify(obj, undefined, pretty ? 4 : undefined);
    return new Promise((resolve, reject) => {
        stream.pipe(createWriteStream(filepath)).on("error", reject).on("finish", resolve);
    });
}
