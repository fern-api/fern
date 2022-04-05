import { logError } from "../../logger";
import { OverridablePackageValueSupplierWithArgument } from "../../OverridablePackageValue";
import { Result } from "../../Result";
import { FileWriter, FileWriterArgs, FileWriterOptions } from "./createFileWriter";
import { createLooseFileWriter } from "./createLooseFileWriter";

export function createLooseJsonFileWriter<T>({
    relativePath,
    isForBundlesOnly,
    generateJson,
    handleExistingFile,
    options,
}: {
    relativePath: string;
    isForBundlesOnly: boolean;
    generateJson: OverridablePackageValueSupplierWithArgument<FileWriterArgs, T>;
    handleExistingFile?: (value: Record<string, unknown>, args: FileWriterArgs) => Result;
    options?: FileWriterOptions;
}): FileWriter {
    return createLooseFileWriter({
        relativePath,
        isForBundlesOnly,
        generateFile: (args) => {
            const json = generateJson(args, args.lernaPackage.name);
            return json != null ? JSON.stringify(json) : undefined;
        },
        handleExistingFile:
            handleExistingFile != null
                ? (contents, args) => {
                      let parsed: Record<string, unknown>;
                      try {
                          parsed = JSON.parse(contents);
                      } catch (error) {
                          logError({
                              packageName: args.lernaPackage.name,
                              message: `Failed to parse ${relativePath}`,
                              additionalContent: JSON.stringify(error),
                          });
                          return Result.failure();
                      }
                      return handleExistingFile(parsed, args);
                  }
                : undefined,
        options,
    });
}
