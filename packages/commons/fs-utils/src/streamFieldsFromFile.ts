import { createReadStream } from "fs";
import StreamJSON from "stream-json";
import Assembler from "stream-json/Assembler.js";

import { AbsoluteFilePath } from "./AbsoluteFilePath.js";

/**
 * Streams a JSON file and extracts only the specified top-level fields,
 * assembling them into a partial object. This is much more memory-efficient
 * than loading the entire file when only a subset of fields is needed.
 *
 * Uses stream-json to tokenize the file without creating a single large
 * string, then manually routes tokens for matching top-level keys through
 * an Assembler to reconstruct only the requested values. Once all requested
 * fields are found, the stream is destroyed early to avoid reading the
 * rest of the file.
 */
export async function streamFieldsFromFile(filePath: AbsoluteFilePath, fields: string[]): Promise<unknown> {
    const fieldSet = new Set(fields);
    return new Promise((resolve, reject) => {
        const jsonStream = StreamJSON.parser({
            streamValues: false
        });

        const result: Record<string, unknown> = {};
        let currentKey: string | null = null;
        let rootEntered = false;
        let capturing = false;
        let assembler: InstanceType<typeof Assembler> | null = null;
        let fieldsFound = 0;
        let resolved = false;

        jsonStream.on("data", (chunk: { name: string; value?: string }) => {
            if (resolved) {
                return;
            }

            if (!rootEntered && chunk.name === "startObject") {
                rootEntered = true;
                return;
            }

            if (capturing && assembler != null) {
                assembler.consume(chunk);
                if (assembler.done) {
                    if (currentKey != null) {
                        result[currentKey] = assembler.current;
                        fieldsFound++;
                    }
                    capturing = false;
                    assembler = null;
                    currentKey = null;

                    if (fieldsFound === fields.length) {
                        resolved = true;
                        readStream.destroy();
                        resolve(result);
                    }
                }
                return;
            }

            if (rootEntered && chunk.name === "keyValue") {
                const key = chunk.value as string;
                if (fieldSet.has(key)) {
                    currentKey = key;
                    capturing = true;
                    assembler = new Assembler();
                }
            }
        });

        jsonStream.on("end", () => {
            if (!resolved) {
                resolved = true;
                resolve(result);
            }
        });

        jsonStream.on("error", (err: Error) => {
            if (!resolved) {
                reject(err);
            }
        });

        const readStream = createReadStream(filePath);
        readStream.on("error", (err: Error) => {
            if (!resolved) {
                reject(err);
            }
        });
        readStream.pipe(jsonStream);
    });
}
