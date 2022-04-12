import { Logger, Monorepo, Package, Result } from "@mrlint/commons";
import { LazyVirtualFileSystem } from "@mrlint/virtual-file-system";
import { FileSystemWithUtilities } from "@mrlint/virtual-file-system/src/FileSystemWithUtilities";
import chalk from "chalk";
import { diffLines } from "diff";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { format } from "./formatFiles";

export async function handleFileSystemDiffs({
    monorepo,
    packageToLint,
    fileSystem,
    logger,
    shouldFix,
}: {
    monorepo: Monorepo;
    packageToLint: Package;
    fileSystem: LazyVirtualFileSystem;
    logger: Logger;
    shouldFix: boolean;
}): Promise<Result> {
    let result = Result.success();

    const absolutePackagePath = path.join(monorepo.root.fullPath, packageToLint.relativePath);

    // format files
    await fileSystem.visitTouchedFiles(async ({ fullPath, relativePath, contents }) => {
        try {
            const formatted = await format({
                filepath: fullPath,
                fileContents: contents,
                prettierParser: undefined,
            });
            await fileSystem.writeFile(relativePath, formatted);
        } catch (error) {
            logger.warn({
                message: `Failed to prettify ${path.relative(absolutePackagePath, fullPath)}`,
                error,
            });
        }
    });
    const touchedFiles = fileSystem.getTouchedFiles().filter((file) => file.newContents !== file.originalContents);

    if (shouldFix) {
        await writeFiles({
            touchedFiles,
            logger,
            absolutePackagePath,
        });
    } else if (touchedFiles.length > 0) {
        result = Result.failure();
        for (const touchedFile of touchedFiles) {
            logger.error({
                message: `${path.relative(absolutePackagePath, touchedFile.fullPath)} differs from expected value`,
                additionalContent: getDiff(touchedFile.originalContents ?? "", touchedFile.newContents),
            });
        }
    }

    fileSystem.clearCache();
    return result;
}

async function writeFiles({
    touchedFiles,
    logger,
    absolutePackagePath,
}: {
    touchedFiles: FileSystemWithUtilities.TouchedFile[];
    logger: Logger;
    absolutePackagePath: string;
}): Promise<Result> {
    let result = Result.success();

    for (const touchedFile of touchedFiles) {
        const relativePath = path.relative(absolutePackagePath, touchedFile.fullPath);
        const fileDirectory = path.dirname(touchedFile.fullPath);
        try {
            await mkdir(fileDirectory, { recursive: true });
            await writeFile(touchedFile.fullPath, touchedFile.newContents);
            logger.info({
                message: chalk.green(`Fixed ${relativePath}`),
            });
        } catch (error) {
            logger.error({
                message: `Failed to write ${relativePath}`,
                error,
            });
            result = Result.failure();
        }
    }

    return result;
}

function getDiff(before: string, after: string): string {
    const diff = diffLines(before, after, {});

    const indexOfFirstDiff = diff.findIndex((part) => part.added || part.removed || false);
    const indexOfLastDiff = findLastIndex(diff, (part) => part.added || part.removed || false);

    const diffStrings: string[] = [];
    for (let i = indexOfFirstDiff; i <= indexOfLastDiff; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const part = diff[i]!;
        const prefix = part.added ? "+" : part.removed ? "-" : " ";
        const writer = part.added ? chalk.green : part.removed ? chalk.red : chalk.gray;

        const diffString = part.value
            .split("\n")
            .map((line) => writer(`${prefix} ${line}`))
            .join("\n");
        diffStrings.push(diffString);
    }
    return diffStrings.join("\n");
}

function findLastIndex<T>(items: readonly T[], predicate: (item: T) => boolean): number {
    let i = items.length - 1;
    while (i >= 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (predicate(items[i]!)) {
            break;
        }
        i--;
    }
    return i;
}
