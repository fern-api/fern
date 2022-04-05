import { readdir } from "fs/promises";
import { FileWriter, FileWriterArgs } from "./file-writers/utils/createFileWriter";
import { writeBabelConfig } from "./file-writers/writeBabelConfig";
import { writeCdkJson } from "./file-writers/writeCdkJson";
import { writeCracoConfigJs } from "./file-writers/writeCracoConfigJs";
import { writeDeclarationsDTs } from "./file-writers/writeDeclarationsDTs";
import { writeDepcheckRc } from "./file-writers/writeDepcheckRc";
import { writeDeploy } from "./file-writers/writeDeploy";
import { writeEnvCmdRc } from "./file-writers/writeEnvCmdRc";
import { writeJestConfig } from "./file-writers/writeJestConfig";
import { writePackageJson } from "./file-writers/writePackageJson";
import { writePrettierRc } from "./file-writers/writePrettierRc";
import { writeStylelintRc } from "./file-writers/writeStylelintRc";
import { writeTsConfig } from "./file-writers/writeTsConfig";
import { logError } from "./logger";
import { createOverridablePackageValueSupplier } from "./OverridablePackageValue";
import { Result } from "./Result";
import { LernaPackage } from "./types";

const FILE_WRITERS: FileWriter[] = [
    // write prettierrc first so we can format all the files
    writePrettierRc,
    writePackageJson,
    writeTsConfig,
    writeStylelintRc,
    writeBabelConfig,
    writeJestConfig,
    writeDepcheckRc,
    writeEnvCmdRc,
    writeCracoConfigJs,
    writeDeclarationsDTs,
    writeDeploy,
    writeCdkJson,
];

const getAllowedFilesForPackage = createOverridablePackageValueSupplier({
    defaultValue: new Set([
        ...FILE_WRITERS.filter(({ isForBundlesOnly }) => !isForBundlesOnly).map(({ relativePath }) => relativePath),
        "src",
        "lib",
        ".DS_Store",
        "tsconfig.tsbuildinfo",
        "node_modules",
        "yarn-error.log",
    ]),
    getValueForBundle: (allowedFiles) =>
        new Set([
            ...allowedFiles,
            ...FILE_WRITERS.map(({ relativePath }) => relativePath),
            ".env.local",
            "build",
            "public",
            "cdk.json",
            "cdk.out",
            "cdk.context.json",
        ]),
    overrides: {
        "@trace/trace-v1": (allowedFiles) => new Set([...allowedFiles, "scripts"]),
    },
});

export async function writePackageFiles({
    lernaPackage,
    packagesByName,
    shouldFix,
}: {
    lernaPackage: LernaPackage;
    packagesByName: Record<string, LernaPackage | undefined>;
    shouldFix: boolean;
}): Promise<Result> {
    let result = Result.success();

    const writerArgs: FileWriterArgs = {
        lernaPackage: lernaPackage,
        allPackages: packagesByName,
        shouldFix,
    };

    for (const writer of FILE_WRITERS) {
        result = result.accumulate(await writer.write(writerArgs));
    }

    const files = await readdir(lernaPackage.location);

    // ensure no extra files
    for (const file of files) {
        const allowedFiles = getAllowedFilesForPackage(lernaPackage.name);
        if (!allowedFiles.has(file)) {
            logError({
                packageName: lernaPackage.name,
                message: `Unexpected file: ${file}`,
            });
            result = Result.failure();
        }
    }

    return result;
}
