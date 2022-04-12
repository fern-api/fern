import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";

const FILENAME = ".env-cmdrc";

export const EnvCmdRule: Rule.PackageRule = {
    ruleId: "env-cmd",
    type: RuleType.PACKAGE,
    targetedPackages: [PackageType.REACT_APP],
    run: runRule,
};

async function runRule({ fileSystems, packageToLint, logger }: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);
    const existingStr = await fileSystemForPackage.readFile(FILENAME);
    const existing = existingStr != null ? JSON.parse(existingStr) : undefined;

    const contents = {
        ...existing,
        development: existing.development ?? {},
        production: existing.production ?? {},
    };

    try {
        await fileSystemForPackage.writeFile(FILENAME, JSON.stringify(contents));
        return Result.success();
    } catch (e) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
        });
        return Result.failure();
    }
}
