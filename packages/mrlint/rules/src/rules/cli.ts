import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";

export const CliRule: Rule.PackageRule = {
    ruleId: "cli",
    type: RuleType.PACKAGE,
    targetedPackages: [PackageType.TYPESCRIPT_CLI],
    run: runRule,
};

const FILENAME = "cli";

const CONTENTS = `#!/usr/bin/env node

require("./lib/index");`;

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
