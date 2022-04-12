import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";

export const DeclarationsRule: Rule.PackageRule = {
    ruleId: "declarations",
    type: RuleType.PACKAGE,
    targetedPackages: [PackageType.REACT_APP],
    run: runRule,
};

const FILENAME = "src/declarations.d.ts";

const CONTENTS = `declare module "*.module.scss";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";`;

async function runRule({ fileSystems, packageToLint, logger }: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);
    try {
        await fileSystemForPackage.writeFile(FILENAME, CONTENTS);
        return Result.success();
    } catch (error) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
            error,
        });
        return Result.failure();
    }
}
