import { mkdir, rename, rm } from "fs/promises";
import path from "path";

const TARGET_EXISTS_CODES = new Set(["ENOTEMPTY", "EEXIST", "EPERM"]);

/**
 * Moves a fully-written `stagingDir` into place at `targetDir` so that readers never observe a partially
 * written directory. If `targetDir` already exists, it is kept when `isComplete` reports that it is usable
 * (e.g. another process published it first); otherwise it is treated as leftovers and replaced.
 */
export async function publishDirectory({
    stagingDir,
    targetDir,
    isComplete
}: {
    stagingDir: string;
    targetDir: string;
    isComplete: () => Promise<boolean>;
}): Promise<void> {
    await mkdir(path.dirname(targetDir), { recursive: true });
    try {
        await rename(stagingDir, targetDir);
        return;
    } catch (error) {
        if (!isTargetExistsError(error)) {
            await rm(stagingDir, { recursive: true, force: true });
            throw error;
        }
    }

    try {
        if (!(await isComplete())) {
            await rm(targetDir, { recursive: true, force: true });
            try {
                await rename(stagingDir, targetDir);
            } catch (error) {
                // lost a race to another process replacing the leftovers; fine as long as theirs is usable
                if (!isTargetExistsError(error) || !(await isComplete())) {
                    throw error;
                }
            }
        }
    } finally {
        await rm(stagingDir, { recursive: true, force: true });
    }
}

function isTargetExistsError(error: unknown): boolean {
    return error instanceof Error && TARGET_EXISTS_CODES.has((error as NodeJS.ErrnoException).code ?? "");
}
