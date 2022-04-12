import { Monorepo, Result, Rule } from "@mrlint/commons";
import { FileSystem } from "@mrlint/virtual-file-system";
import path from "path/posix";

export declare namespace runRuleOnPackage {
    export interface Args extends Pick<Rule.PackageRuleRunnerArgs, "packageToLint" | "logger"> {
        monorepo: Monorepo;
        rule: Rule.PackageRule;
        fileSystem: FileSystem;
    }
}

export async function runRuleOnPackage({
    monorepo,
    packageToLint,
    rule,
    fileSystem,
    logger,
}: runRuleOnPackage.Args): Promise<Result> {
    const relativePathToRoot = path.relative(
        path.join(monorepo.root.fullPath, packageToLint.relativePath),
        monorepo.root.fullPath
    );

    logger.debug({
        message: "Running rule...",
    });

    let result: Result;
    try {
        result = await rule.run({
            packageToLint,
            allPackages: monorepo.packages,
            relativePathToRoot,
            relativePathToSharedConfigs: path.join(relativePathToRoot, monorepo.root.config.sharedConfigs),
            fileSystems: {
                getFileSystemForMonorepo: () => fileSystem,
                getFileSystemForPackage: (p) => fileSystem.getFileSystemForPrefix(p.relativePath),
            },
            logger,
        });
    } catch (error) {
        logger.error({
            message: "Encountered exception when running rule",
            error,
        });
        result = Result.failure();
    }

    logger.debug({
        message: "Done running rule.",
    });

    return result;
}
