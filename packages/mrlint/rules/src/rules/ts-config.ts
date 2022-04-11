import { Logger, Package, PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import path from "path";
import { CompilerOptions, ProjectReference } from "typescript";
import { keyPackagesByNpmName } from "../utils/keyPackagesByNpmName";
import { tryGetPackageJson } from "../utils/tryGetPackageJson";

export const TsConfigRule: Rule.PackageRule = {
    ruleId: "ts-config",
    type: RuleType.PACKAGE,
    targetedPackages: [
        PackageType.REACT_APP,
        PackageType.REACT_LIBRARY,
        PackageType.TYPESCRIPT_LIBRARY,
        PackageType.TYPESCRIPT_CLI,
    ],
    run: runRule,
};

export type TsConfig = {
    extends?: string;
    compilerOptions?: CompilerOptions;
    include?: string[];
    references: ProjectReference[];
};

const FILENAME = "tsconfig.json";

async function runRule({
    fileSystems,
    relativePathToSharedConfigs,
    packageToLint,
    allPackages,
    logger,
}: Rule.PackageRuleRunnerArgs): Promise<Result> {
    let tsConfig: TsConfig;
    try {
        tsConfig = await generateTsConfig({
            packageToLint,
            allPackages,
            relativePathToSharedConfigs,
            logger,
        });
    } catch (error) {
        logger.error({
            message: "Failed to generate TS Config",
            error,
        });
        return Result.failure();
    }

    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);

    try {
        await fileSystemForPackage.writeFile(FILENAME, JSON.stringify(tsConfig));
    } catch (error) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
            error,
        });
        return Result.failure();
    }

    return Result.success();
}

async function generateTsConfig({
    packageToLint,
    allPackages,
    relativePathToSharedConfigs,
    logger,
}: {
    packageToLint: Package;
    allPackages: readonly Package[];
    relativePathToSharedConfigs: string;
    logger: Logger;
}): Promise<TsConfig> {
    const packageJson = tryGetPackageJson(packageToLint, logger);
    if (packageJson == null) {
        throw new Error("package.json does not exist");
    }
    const packagesByNpmName = keyPackagesByNpmName(allPackages);

    return {
        extends: path.join(relativePathToSharedConfigs, "tsconfig.shared.json"),
        compilerOptions: {
            composite: true,
            outDir: "./lib",
            rootDir: "src",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            module: "CommonJS" as any,
        },
        include: ["./src"],
        references: Object.keys(packageJson.dependencies ?? {})
            .reduce<string[]>((acc, dependency) => {
                const packageOfDependency = packagesByNpmName[dependency];
                if (packageOfDependency != null) {
                    acc.push(path.relative(packageToLint.relativePath, packageOfDependency.relativePath));
                }
                return acc;
            }, [])
            .sort()
            .map((path) => ({ path })),
    };
}
