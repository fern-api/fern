import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import path from "path";

export const StyleLintRule: Rule.PackageRule = {
    ruleId: "stylelint",
    type: RuleType.PACKAGE,
    targetedPackages: [PackageType.REACT_APP, PackageType.REACT_LIBRARY],
    run: runRule,
};

const FILENAME = ".stylelintrc.json";

async function runRule({
    fileSystems,
    packageToLint,
    relativePathToSharedConfigs,
    logger,
}: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const contents = {
        extends: [path.join(relativePathToSharedConfigs, "stylelintrc.shared.json")],
    };

    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);

    try {
        await fileSystemForPackage.writeFile(FILENAME, JSON.stringify(contents));
    } catch (error) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
            error,
        });
        return Result.failure();
    }

    return Result.success();
}
