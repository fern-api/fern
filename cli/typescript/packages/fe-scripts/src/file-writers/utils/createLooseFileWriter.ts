import path from "path";
import { Result } from "../../Result";
import { createFileWriter, FileWriter, FileWriterArgs, FileWriterOptions } from "./createFileWriter";
import { getFileContents } from "./getFileContents";

export function createLooseFileWriter({
    relativePath,
    isForBundlesOnly,
    generateFile,
    handleExistingFile,
    options,
}: {
    relativePath: string;
    isForBundlesOnly: boolean;
    generateFile: (args: FileWriterArgs) => string | undefined;
    handleExistingFile?: (contents: string, args: FileWriterArgs) => Result;
    options?: FileWriterOptions;
}): FileWriter {
    const fileWriter = createFileWriter({ relativePath, isForBundlesOnly, generateFile, options });
    const write = async (args: FileWriterArgs) => {
        const toWrite = generateFile(args);
        if (toWrite == null) {
            return Result.success();
        }

        const pathToFile = path.join(args.lernaPackage.location, relativePath);
        const existing = await getFileContents(pathToFile);

        if (existing == null) {
            return fileWriter.write(args);
        }

        if (handleExistingFile == null) {
            return Result.success();
        }

        return handleExistingFile(existing, args);
    };

    return {
        relativePath,
        write,
        isForBundlesOnly,
    };
}
