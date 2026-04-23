import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { isAbsolute, resolve } from "path";

/**
 * Read a raw `--input` value (or equivalent JSON-payload flag) and return the
 * raw JSON string. Supports three forms:
 *
 *   - `-` — read JSON from stdin
 *   - `@path/to.json` — read JSON from a file (path is resolved relative to cwd)
 *   - anything else — treated as an inline JSON string
 *
 * This helper does **not** parse or validate the JSON itself; it only resolves
 * where the payload text comes from. Callers should JSON-parse and validate
 * against their Zod schema afterwards.
 */
export async function readRawJsonInput({
    value,
    cwd,
    stdin = process.stdin
}: {
    value: string;
    cwd: string;
    stdin?: NodeJS.ReadableStream;
}): Promise<string> {
    if (value === "-") {
        return readStream(stdin);
    }
    if (value.startsWith("@")) {
        const rawPath = value.slice(1);
        const filePath = isAbsolute(rawPath) ? rawPath : resolve(cwd, rawPath);
        try {
            return await readFile(filePath, "utf-8");
        } catch (err) {
            throw new CliError({
                message: `Failed to read --input file ${filePath}: ${(err as Error).message}`,
                code: CliError.Code.ConfigError
            });
        }
    }
    return value;
}

/**
 * Parse a raw JSON string into an `unknown` object, wrapping parse failures in
 * a `CliError` with a helpful message.
 */
export function parseJsonInput(raw: string): unknown {
    try {
        return JSON.parse(raw);
    } catch (err) {
        throw new CliError({
            message: `--input is not valid JSON: ${(err as Error).message}`,
            code: CliError.Code.ConfigError
        });
    }
}

/**
 * Convenience: read + parse in one call.
 */
export async function readAndParseJsonInput({
    value,
    cwd,
    stdin
}: {
    value: string;
    cwd: string;
    stdin?: NodeJS.ReadableStream;
}): Promise<unknown> {
    const raw = await readRawJsonInput({ value, cwd, stdin });
    return parseJsonInput(raw);
}

async function readStream(stream: NodeJS.ReadableStream): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks as unknown as Uint8Array[]).toString("utf-8");
}
