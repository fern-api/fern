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
        let capturing = false;
        let assembler: InstanceType<typeof Assembler> | null = null;
        let fieldsFound = 0;
        let resolved = false;
        // depth tracks how deep we are inside the root object.
        // 0 = before the root object, 1 = inside root (top-level keys), 2+ = nested.
        let depth = 0;
        // skipDepth tracks depth when skipping a non-matching top-level value.
        // While > 0 we ignore all tokens until we return to depth 1.
        let skipDepth = 0;

        jsonStream.on("data", (chunk: { name: string; value?: string }) => {
            if (resolved) {
                return;
            }

            // Track depth for objects and arrays
            if (chunk.name === "startObject" || chunk.name === "startArray") {
                depth++;
            }

            // While capturing a matching field, feed all tokens to the assembler
            if (capturing && assembler != null) {
                assembler.consume(chunk);
                if (chunk.name === "endObject" || chunk.name === "endArray") {
                    depth--;
                }
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
                        return;
                    }
                }
                return;
            }

            // While skipping a non-matching top-level value, track depth
            if (skipDepth > 0) {
                if (chunk.name === "endObject" || chunk.name === "endArray") {
                    depth--;
                    skipDepth--;
                } else if (chunk.name === "startObject" || chunk.name === "startArray") {
                    skipDepth++;
                }
                return;
            }

            if (chunk.name === "endObject" || chunk.name === "endArray") {
                depth--;
                return;
            }

            // Only process keyValue tokens at depth 1 (top-level keys of the root object)
            if (depth === 1 && chunk.name === "keyValue") {
                const key = chunk.value as string;
                if (fieldSet.has(key)) {
                    currentKey = key;
                    capturing = true;
                    assembler = new Assembler();
                } else {
                    // Start skipping the value of this non-matching key.
                    // The next token will be the start of the value; skipDepth
                    // will be incremented when we see startObject/startArray,
                    // or the value is a primitive and skipDepth stays 0.
                    skipDepth = 0;
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
