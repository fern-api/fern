import { createReadStream } from "fs";
import { AbsoluteFilePath } from "./AbsoluteFilePath";
import StreamObject from "stream-json/streamers/StreamObject.js";

export async function streamObjectFromFile(filePath: AbsoluteFilePath): Promise<unknown> {
    const jsonStream = StreamObject.withParser();
    const accumulator = {};

    jsonStream.on("data", ({ key, value }: { key: string; value: unknown }) =>
        Object.assign(accumulator, { [key]: value })
    );

    return new Promise((resolve, reject) => {
        createReadStream(filePath)
            .pipe(jsonStream)
            .on("error", reject)
            .on("finish", () => {
                resolve(accumulator);
            });
    });
}
