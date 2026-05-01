import { AbsoluteFilePath, streamObjectToFile } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";

import { readFile, writeFile } from "fs/promises";
import { JsonStreamStringify } from "json-stream-stringify";
import { Readable, Writable } from "stream";
import { pipeline } from "stream/promises";

/**
 * Conventional Unix marker used on I/O flags: `-` means stdin for inputs and
 * stdout for outputs, depending on the context of the flag.
 */
export const STDIO_MARKER = "-";

/**
 * Returns true when `value` is the conventional `-` stdin/stdout marker.
 */
export function isStdioMarker(value: string | undefined | null): value is "-" {
    return value === STDIO_MARKER;
}

/**
 * Read the contents of a file path, or stdin when the value is `-`.
 *
 * Pass a custom stream via `stdin` in tests.
 */
export async function readInput(
    pathOrDash: string,
    { stdin = process.stdin }: { stdin?: Readable } = {}
): Promise<string> {
    if (isStdioMarker(pathOrDash)) {
        return readStreamToString(stdin);
    }
    return readFile(pathOrDash, "utf-8");
}

/**
 * Interpret a value as either inline JSON or a file path (falling back to stdin
 * when the value is `-`). Cheapest-operation-first: a value that obviously
 * looks like JSON is parsed directly, a file path is only read from disk when
 * JSON parsing fails.
 *
 * Throws `CliError` when the input is neither a valid JSON document nor a
 * readable file.
 */
export async function readJsonOrPath(
    input: string,
    {
        stdin = process.stdin,
        flagName
    }: {
        stdin?: Readable;
        /** Optional flag name used to produce clearer error messages. */
        flagName?: string;
    } = {}
): Promise<unknown> {
    if (isStdioMarker(input)) {
        const raw = await readStreamToString(stdin);
        return parseJsonOrThrow(raw, { flagName, source: "stdin" });
    }

    const trimmed = input.trim();
    if (looksLikeJson(trimmed)) {
        try {
            return JSON.parse(trimmed);
        } catch {
            // Fall through — try reading as a file path.
        }
    }

    let raw: string;
    try {
        raw = await readFile(input, "utf-8");
    } catch {
        throw new CliError({
            message:
                flagName != null
                    ? `--${flagName}: could not parse value as JSON and could not read it as a file: ${input}`
                    : `Could not parse value as JSON and could not read it as a file: ${input}`,
            code: CliError.Code.ConfigError
        });
    }

    return parseJsonOrThrow(raw, { flagName, source: input });
}

/**
 * Write a JSON-serializable object to a file path, or stream it to stdout when
 * the value is `-`.
 *
 * When writing to a file, `pathOrDash` must be an absolute path.
 */
export async function writeOutputJson(
    pathOrDash: AbsoluteFilePath | "-",
    object: unknown,
    { pretty = true, stdout = process.stdout }: { pretty?: boolean; stdout?: Writable } = {}
): Promise<void> {
    if (isStdioMarker(pathOrDash)) {
        // JsonStreamStringify implements the Readable interface but the library
        // does not export typings that satisfy NodeJS.ReadableStream directly.
        const stream = new JsonStreamStringify(object, undefined, pretty ? 4 : undefined) as NodeJS.ReadableStream;
        await pipeline(stream, stdout, { end: false });
        return;
    }

    await streamObjectToFile(pathOrDash, object, { pretty });
}

/**
 * Write a string or Buffer to a file path, or to stdout when the value is `-`.
 *
 * When writing to a file, `pathOrDash` must be an absolute path.
 */
export async function writeOutputString(
    pathOrDash: AbsoluteFilePath | "-",
    data: string | Buffer,
    { stdout = process.stdout }: { stdout?: Writable } = {}
): Promise<void> {
    if (isStdioMarker(pathOrDash)) {
        await pipeline(Readable.from([data]), stdout, { end: false });
        return;
    }
    await writeFile(pathOrDash, data);
}

/**
 * Enforces the Unix convention that `-` can refer to at most one stdin source
 * and one stdout destination per command invocation. Use one guard instance
 * per command execution and call `claimStdin` / `claimStdout` before consuming
 * stdin/stdout for a given flag.
 */
export class StdioMarkerGuard {
    private stdinFlag: string | undefined;
    private stdoutFlag: string | undefined;

    public claimStdin(flagName: string): void {
        if (this.stdinFlag != null) {
            throw new CliError({
                message: `\"-\" can only refer to stdin once per command, but both --${this.stdinFlag} and --${flagName} were set to \"-\".`,
                code: CliError.Code.ConfigError
            });
        }
        this.stdinFlag = flagName;
    }

    public claimStdout(flagName: string): void {
        if (this.stdoutFlag != null) {
            throw new CliError({
                message: `\"-\" can only refer to stdout once per command, but both --${this.stdoutFlag} and --${flagName} were set to \"-\".`,
                code: CliError.Code.ConfigError
            });
        }
        this.stdoutFlag = flagName;
    }
}

async function readStreamToString(stream: Readable): Promise<string> {
    stream.setEncoding("utf-8");
    let result = "";
    for await (const chunk of stream) {
        // setEncoding("utf-8") ensures chunks are always strings.
        result += chunk as string;
    }
    return result;
}

function looksLikeJson(value: string): boolean {
    if (value.length === 0) {
        return false;
    }
    const first = value[0];
    return first === "{" || first === "[";
}

function parseJsonOrThrow(
    raw: string,
    { flagName, source }: { flagName: string | undefined; source: string }
): unknown {
    try {
        return JSON.parse(raw);
    } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        throw new CliError({
            message:
                flagName != null
                    ? `--${flagName}: invalid JSON from ${source}: ${detail}`
                    : `Invalid JSON from ${source}: ${detail}`,
            code: CliError.Code.ParseError
        });
    }
}
