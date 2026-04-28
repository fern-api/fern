import { CliError } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { isAbsolute, resolve } from "path";

/**
 * Read a raw `--params` value and return the raw JSON string. Supports two
 * forms:
 *
 *   - `@path/to.json` — read JSON from a file (curl-style; path is resolved
 *     relative to cwd)
 *   - anything else — treated as an inline JSON string
 *
 * This helper does **not** parse or validate the JSON itself; it only resolves
 * where the payload text comes from. Callers should JSON-parse and validate
 * against their Zod schema afterwards.
 */
export async function readRawJsonInput({ value, cwd }: { value: string; cwd: string }): Promise<string> {
    if (value.startsWith("@")) {
        const rawPath = value.slice(1);
        const filePath = isAbsolute(rawPath) ? rawPath : resolve(cwd, rawPath);
        try {
            return await readFile(filePath, "utf-8");
        } catch (err) {
            throw new CliError({
                message: `Failed to read --params file ${filePath}: ${(err as Error).message}`,
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
            message: `--params is not valid JSON: ${(err as Error).message}`,
            code: CliError.Code.ConfigError
        });
    }
}

/**
 * Convenience: read + parse in one call.
 */
export async function readAndParseJsonInput({ value, cwd }: { value: string; cwd: string }): Promise<unknown> {
    const raw = await readRawJsonInput({ value, cwd });
    return parseJsonInput(raw);
}
