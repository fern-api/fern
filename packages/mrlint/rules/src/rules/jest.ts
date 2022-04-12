import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import path from "path";

export const JestRule: Rule.PackageRule = {
    ruleId: "jest",
    type: RuleType.PACKAGE,
    targetedPackages: [
        PackageType.REACT_APP,
        PackageType.REACT_LIBRARY,
        PackageType.TYPESCRIPT_LIBRARY,
        PackageType.TYPESCRIPT_CLI,
    ],
    run: runRule,
};

const FILENAME = "jest.config.js";

async function runRule({
    fileSystems,
    packageToLint,
    relativePathToSharedConfigs,
    logger,
}: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const contents = `module.exports = {
...require("${path.join(relativePathToSharedConfigs, "jest.config.shared.json")}"),
};`;

    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);
    try {
        await fileSystemForPackage.writeFile(FILENAME, contents);
        return Result.success();
    } catch (error) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
            error,
        });
        return Result.failure();
    }
}
