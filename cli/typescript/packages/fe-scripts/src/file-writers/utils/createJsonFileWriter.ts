import { OverridablePackageValueSupplierWithArgument } from "../../OverridablePackageValue";
import { createFileWriter, FileWriter, FileWriterArgs, FileWriterOptions } from "./createFileWriter";

export function createJsonFileWriter<T>({
    relativePath,
    isForBundlesOnly,
    generateJson,
    options,
}: {
    relativePath: string;
    isForBundlesOnly: boolean;
    generateJson: OverridablePackageValueSupplierWithArgument<FileWriterArgs, T>;
    options?: FileWriterOptions;
}): FileWriter {
    return createFileWriter({
        relativePath,
        isForBundlesOnly,
        generateFile: (args) => {
            const json = generateJson(args, args.lernaPackage.name);
            return json != null ? JSON.stringify(json) : undefined;
        },
        options,
    });
}
