import { PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import produce from "immer";

interface DepcheckConfig {
    ignores?: string[];
    "ignore-patterns"?: string[];
}

export const DepcheckRule: Rule.PackageRule = {
    ruleId: "depcheck",
    type: RuleType.PACKAGE,
    targetedPackages: [
        PackageType.REACT_APP,
        PackageType.REACT_LIBRARY,
        PackageType.TYPESCRIPT_LIBRARY,
        PackageType.TYPESCRIPT_CLI,
    ],
    run: runRule,
};

const FILENAME = ".depcheckrc.json";

async function runRule({ fileSystems, packageToLint, logger }: Rule.PackageRuleRunnerArgs): Promise<Result> {
    let depcheckRc: DepcheckConfig = {
        ignores: ["sass"],
        "ignore-patterns": ["lib", ".eslintrc.json"],
    };

    if (packageToLint.config.type === PackageType.REACT_APP) {
        depcheckRc = produce(depcheckRc, (draft) => {
            if (draft.ignores == null) {
                draft.ignores = [];
            }
            draft.ignores.push("sass");
            if (draft["ignore-patterns"] == null) {
                draft["ignore-patterns"] = [];
            }
            draft["ignore-patterns"].push("lib", ".eslintrc.json");
        });
    }

    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);

    try {
        await fileSystemForPackage.writeFile(FILENAME, JSON.stringify(depcheckRc));
        return Result.success();
    } catch (error) {
        logger.error({
            message: `Failed to write ${FILENAME}`,
            error,
        });
        return Result.failure();
    }
}
