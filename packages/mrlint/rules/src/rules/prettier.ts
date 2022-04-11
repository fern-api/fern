import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import path from "path";

export const PrettierRule: Rule.PackageRule = {
    ruleId: "prettier",
    type: RuleType.PACKAGE,
    targetedPackages: [
        PackageType.REACT_APP,
        PackageType.REACT_LIBRARY,
        PackageType.TYPESCRIPT_LIBRARY,
        PackageType.TYPESCRIPT_CLI,
    ],
    run: runRule,
};

const FILENAME = ".prettierrc.js";

async function runRule({
    fileSystems,
    packageToLint,
    relativePathToRoot,
    logger,
}: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const contents = `module.exports = {
...require("${path.join(relativePathToRoot, ".prettierrc.json")}"),
};`;

    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);

    try {
        await fileSystemForPackage.writeFile(FILENAME, contents);
    } catch (error) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
            error,
        });
        return Result.failure();
    }

    return Result.success();
}
