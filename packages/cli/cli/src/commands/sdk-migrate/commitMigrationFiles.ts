import { randomUUID } from "node:crypto";
import { access, chmod, mkdir, open, rename, rmdir, stat, unlink } from "node:fs/promises";
import { dirname } from "node:path";
import { CliError } from "@fern-api/task-context";

interface MigrationFile {
    contents: string;
    mode?: number;
    path: string;
}

/** Commits the legacy rename/edit and SDK Config write as one rollback-capable operation. */
export async function commitMigrationFiles({
    files,
    remove
}: {
    files: MigrationFile[];
    remove: string[];
}): Promise<void> {
    const writePaths = new Set(files.map((file) => file.path));
    if (writePaths.size !== files.length) {
        throw configError("Migration output paths overlap.");
    }
    if (remove.some((path) => writePaths.has(path))) {
        throw configError("A migration path cannot be written and removed in the same transaction.");
    }

    const transactionId = randomUUID();
    const temporaryFiles = new Map<string, string>();
    const backups = new Map<string, string>();
    const published = new Set<string>();
    const createdDirectories = new Set<string>();
    try {
        for (const file of files) {
            await ensureDirectory(dirname(file.path), createdDirectories);
            const temporaryPath = `${file.path}.fern-migrate-${transactionId}.tmp`;
            const handle = await open(temporaryPath, "wx");
            temporaryFiles.set(file.path, temporaryPath);
            try {
                await handle.writeFile(file.contents, "utf8");
                await handle.sync();
            } finally {
                await handle.close();
            }
            if (file.mode != null) {
                await chmod(temporaryPath, file.mode);
            }
        }

        for (const path of new Set([...files.map((file) => file.path), ...remove])) {
            if (!(await exists(path))) {
                continue;
            }
            const backup = `${path}.fern-migrate-${transactionId}.bak`;
            await rename(path, backup);
            backups.set(path, backup);
        }

        for (const file of files) {
            const temporaryPath = temporaryFiles.get(file.path);
            if (temporaryPath == null) {
                throw new Error(`Missing prepared migration file for ${file.path}`);
            }
            await rename(temporaryPath, file.path);
            temporaryFiles.delete(file.path);
            published.add(file.path);
        }
    } catch (error) {
        await rollback({ backups, published, temporaryFiles, createdDirectories });
        throw error;
    }

    // The new files are fully committed at this point. Backup cleanup is best-effort so a
    // transient unlink failure cannot turn a successful migration into a reported failure whose
    // visible files have already changed.
    await Promise.allSettled([...backups.values()].map((backup) => unlink(backup)));
}

export async function fileMode(path: string): Promise<number | undefined> {
    try {
        return (await stat(path)).mode;
    } catch (error) {
        if (isMissing(error)) {
            return undefined;
        }
        throw error;
    }
}

async function rollback({
    backups,
    published,
    temporaryFiles,
    createdDirectories
}: {
    backups: Map<string, string>;
    published: Set<string>;
    temporaryFiles: Map<string, string>;
    createdDirectories: Set<string>;
}): Promise<void> {
    const rollbackErrors: unknown[] = [];
    for (const path of published) {
        try {
            await unlink(path);
        } catch (error) {
            if (!isMissing(error)) {
                rollbackErrors.push(error);
            }
        }
    }
    for (const [path, backup] of [...backups.entries()].reverse()) {
        try {
            await rename(backup, path);
        } catch (error) {
            rollbackErrors.push(error);
        }
    }
    for (const temporaryPath of temporaryFiles.values()) {
        try {
            await unlink(temporaryPath);
        } catch (error) {
            if (!isMissing(error)) {
                rollbackErrors.push(error);
            }
        }
    }
    for (const directory of [...createdDirectories].reverse()) {
        try {
            await rmdir(directory);
        } catch (error) {
            if (!isMissing(error)) {
                rollbackErrors.push(error);
            }
        }
    }
    if (rollbackErrors.length > 0) {
        throw new AggregateError(rollbackErrors, "SDK migration failed and could not restore every original file.");
    }
}

async function ensureDirectory(directory: string, createdDirectories: Set<string>): Promise<void> {
    const missingDirectories: string[] = [];
    let candidate = directory;
    while (!(await exists(candidate))) {
        missingDirectories.push(candidate);
        const parent = dirname(candidate);
        if (parent === candidate) {
            break;
        }
        candidate = parent;
    }
    for (const missingDirectory of missingDirectories.reverse()) {
        try {
            await mkdir(missingDirectory);
            createdDirectories.add(missingDirectory);
        } catch (error) {
            if (!isAlreadyExists(error)) {
                throw error;
            }
        }
    }
}

async function exists(path: string): Promise<boolean> {
    try {
        await access(path);
        return true;
    } catch (error) {
        if (isMissing(error)) {
            return false;
        }
        throw error;
    }
}

function isMissing(error: unknown): boolean {
    return typeof error === "object" && error != null && "code" in error && error.code === "ENOENT";
}

function isAlreadyExists(error: unknown): boolean {
    return typeof error === "object" && error != null && "code" in error && error.code === "EEXIST";
}

function configError(message: string): CliError {
    return new CliError({ message, code: CliError.Code.ConfigError });
}
