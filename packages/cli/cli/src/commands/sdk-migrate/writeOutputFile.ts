import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError } from "@fern-api/task-context";
import { randomUUID } from "crypto";
import { mkdir, rename, unlink, writeFile } from "fs/promises";
import { basename, dirname, join } from "path";

export async function writeOutputFile(outputPath: AbsoluteFilePath, data: string, force: boolean): Promise<void> {
    const output = outputPath.toString();
    await mkdir(dirname(output), { recursive: true });
    if (!force) {
        try {
            await writeFile(output, data, { flag: "wx" });
            return;
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

    const temporary = join(dirname(output), `.${basename(output)}.${randomUUID()}.tmp`);
    try {
        await writeFile(temporary, data, { flag: "wx" });
        await rename(temporary, output);
    } catch (error) {
        await removeTemporaryFile(temporary, error);
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
