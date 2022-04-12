import { Logger, Monorepo, Package, Result, Rule } from "@mrlint/commons";
import { FileSystem } from "@mrlint/virtual-file-system";
import { runRuleOnPackage } from "./runRuleOnPackage";

export declare namespace lintPackage {
    export interface Args extends Pick<Rule.PackageRuleRunnerArgs, "packageToLint"> {
        monorepo: Monorepo;
        rules: Rule.PackageRule[];
        getLoggerForRule: (args: { rule: Rule; package: Package | undefined }) => Logger;
        fileSystem: FileSystem;
    }
}

export async function lintPackage({
    monorepo,
    packageToLint,
    rules,
    fileSystem,
    getLoggerForRule,
}: lintPackage.Args): Promise<Result> {
    const result = Result.success();
    for (const rule of rules) {
        result.accumulate(
            await runRuleOnPackage({
                monorepo,
                packageToLint,
                rule,
                fileSystem,
                logger: getLoggerForRule({
                    rule,
                    package: packageToLint,
                }),
            })
        );
    }
    return result;
}
