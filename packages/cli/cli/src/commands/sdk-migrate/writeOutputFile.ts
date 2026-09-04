import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { randomUUID } from "crypto";
import { link, mkdir, rename, unlink, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";

export async function writeOutputFile(outputPath: AbsoluteFilePath, data: string, force: boolean): Promise<void> {
    const output = outputPath.toString();
    await mkdir(dirname(output), { recursive: true });
    const temporary = join(dirname(output), `.${basename(output)}.${randomUUID()}.tmp`);
    try {
        await writeFile(temporary, data, { flag: "wx" });
        if (force) {
            await rename(temporary, output);
        } else {
            await linkWithoutReplacing(temporary, output);
            await unlink(temporary);
        }
    } catch (error) {
        await removeTemporaryFile(temporary, error);
        throw error;
    }
}

async function linkWithoutReplacing(temporary: string, output: string): Promise<void> {
    try {
        // The temporary file and destination share a directory, so this publishes the complete
        // document atomically while preserving the no-overwrite contract.
        await link(temporary, output);
    } catch (error) {
        if (isErrorWithCode(error, "EEXIST")) {
            throw new CliError({
                message: `Output file '${output}' already exists. Use --force to replace it.`,
                code: CliError.Code.ConfigError
            });
        }
        throw error;
    }
}

async function removeTemporaryFile(temporary: string, originalError?: unknown): Promise<void> {
    try {
        await unlink(temporary);
    } catch (cleanupError) {
        if (isErrorWithCode(cleanupError, "ENOENT")) {
            return;
        }
        if (originalError != null) {
            throw new AggregateError(
                [originalError, cleanupError],
                `Could not complete the output write or remove '${temporary}'`
            );
        }
        throw cleanupError;
    }
}

function isErrorWithCode(error: unknown, code: string): error is NodeJS.ErrnoException {
    return error instanceof Error && "code" in error && error.code === code;
}
