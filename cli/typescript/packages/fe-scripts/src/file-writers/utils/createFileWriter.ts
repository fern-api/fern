import chalk from "chalk";
import { diffLines } from "diff";
import { writeFile } from "fs/promises";
import path from "path";
import prettier, { BuiltInParserName } from "prettier";
import { logError, logSuccess } from "../../logger";
import { Result } from "../../Result";
import { FilePath, LernaPackage, PackageName } from "../../types";
import { isBundle } from "../../utils";
import { getFileContents } from "./getFileContents";

export type FileWriter = {
    relativePath: string;
    isForBundlesOnly: boolean;
    write: (args: FileWriterArgs) => Promise<Result>;
};

export interface FileWriterArgs {
    lernaPackage: LernaPackage;
    allPackages: Record<PackageName, LernaPackage | undefined>;
    shouldFix: boolean;
}

export interface FileWriterOptions {
    prettierParser?: BuiltInParserName;
}

export function createFileWriter({
    relativePath,
    isForBundlesOnly,
    generateFile,
    options,
}: {
    relativePath: string;
    isForBundlesOnly: boolean;
    generateFile: (args: FileWriterArgs) => string | undefined;
    options?: FileWriterOptions;
}): FileWriter {
    const write = async (args: FileWriterArgs) => {
        if (isForBundlesOnly && !isBundle(args.lernaPackage.name)) {
            return Result.success();
        }

        let toWrite: string | undefined;
        try {
            toWrite = generateFile(args);
        } catch (error) {
            logError({
                packageName: args.lernaPackage.name,
                message: "Failed to generate file",
                additionalContent: JSON.stringify(error),
            });
            return Result.failure();
        }
        if (toWrite == null) {
            return Result.success();
        }

        const pathToFile = path.join(args.lernaPackage.location, relativePath);
        const existing = await getFileContents(pathToFile);

        if (!args.shouldFix) {
            if (existing == null) {
                logError({
                    packageName: args.lernaPackage.name,
                    message: `${relativePath} does not exist.`,
                });
                return Result.failure();
            }

            let formatted: string;
            try {
                formatted = await format({
                    pathToFile,
                    fileContents: toWrite,
                    prettierParser: options?.prettierParser,
                });
                if (formatted === existing) {
                    return Result.success();
                }
            } catch (error) {
                logError({
                    packageName: args.lernaPackage.name,
                    message: `Failed to prettify ${relativePath} for comparison`,
                    additionalContent: JSON.stringify(error),
                });
                return Result.failure();
            }

            logError({
                packageName: args.lernaPackage.name,
                message: `${relativePath} differs from expected value.`,
                additionalContent: getDiff(existing, formatted),
            });
            return Result.failure();
        }

        try {
            await writeFile(pathToFile, toWrite);
        } catch (error) {
            logError({
                packageName: args.lernaPackage.name,
                message: `Failed to write ${relativePath}.`,
                additionalContent: JSON.stringify(error),
            });
            return Result.failure();
        }

        let formatted: string;
        try {
            formatted = await formatFile({ pathToFile, prettierParser: options?.prettierParser });
        } catch (error) {
            logError({
                packageName: args.lernaPackage.name,
                message: `Failed to prettify ${relativePath}`,
                additionalContent: JSON.stringify(error),
            });
            return Result.failure();
        }

        if (existing !== formatted) {
            logSuccess({
                packageName: args.lernaPackage.name,
                message: `Fixed ${relativePath}`,
            });
        }
        return Result.success();
    };

    return {
        relativePath,
        write,
        isForBundlesOnly,
    };
}

async function formatFile({
    pathToFile,
    prettierParser,
}: {
    pathToFile: FilePath;
    prettierParser: BuiltInParserName | undefined;
}): Promise<string> {
    const fileContents = await getFileContents(pathToFile);
    if (fileContents == null) {
        throw new Error("File does not exist");
    }
    const formatted = await format({ fileContents, pathToFile, prettierParser });
    writeFile(pathToFile, formatted);
    return formatted;
}

async function format({
    fileContents,
    pathToFile,
    prettierParser,
}: {
    fileContents: string;
    pathToFile: FilePath;
    prettierParser: BuiltInParserName | undefined;
}): Promise<string> {
    const prettierOptions = await prettier.resolveConfig(pathToFile, {
        useCache: false,
    });
    if (prettierOptions == null) {
        throw new Error("Could not locate prettier config.");
    }

    return prettier.format(fileContents, {
        ...prettierOptions,
        filepath: pathToFile,
        parser: prettierParser,
    });
}

function getDiff(before: string, after: string): string {
    const diff = diffLines(before, after);

    const indexOfFirstDiff = diff.findIndex((part) => part.added || part.removed || false);
    const indexOfLastDiff = findLastIndex(diff, (part) => part.added || part.removed || false);

    let diffString = "";
    for (let i = indexOfFirstDiff; i <= indexOfLastDiff; i++) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const part = diff[i]!;
        const writer = part.added ? chalk.green : part.removed ? chalk.red : chalk.gray;
        diffString += writer(part.value);
    }
    return diffString;
}

function findLastIndex<T>(items: readonly T[], predicate: (item: T) => boolean): number {
    let i = items.length - 1;
    while (i-- >= 0) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (predicate(items[i]!)) {
            break;
        }
    }
    return i;
}
