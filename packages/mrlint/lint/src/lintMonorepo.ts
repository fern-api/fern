import { Monorepo, MonorepoLoggers, Package, Result, Rule, RuleType } from "@mrlint/commons";
import { LazyVirtualFileSystem } from "@mrlint/virtual-file-system";
import { handleFileSystemDiffs } from "./handleFileSystemDiffs";
import { lintPackage } from "./package-rules/lintPackage";

export declare namespace lintMonorepo {
    export interface Args {
        monorepo: Monorepo;
        rules: Rule[];
        loggers: MonorepoLoggers;
        shouldFix: boolean;
    }
}

export async function lintMonorepo({ monorepo, rules, loggers, shouldFix }: lintMonorepo.Args): Promise<Result> {
    const result = Result.success();
    const fileSystem = new LazyVirtualFileSystem(monorepo.root.fullPath);

    const [, packageRules] = partition<Rule.MonorepoRule, Rule.PackageRule>(
        rules,
        (rule): rule is Rule.MonorepoRule => rule.type === RuleType.MONOREPO
    );

    // TODO: Lint with monorepo rules

    for (const packageToLint of monorepo.packages) {
        const loggerForPackage = loggers.getLoggerForPackage(packageToLint);
        loggerForPackage.debug({
            message: "Linting...",
        });
        result.accumulate(
            await lintPackage({
                monorepo,
                packageToLint,
                rules: packageRules.filter((rule) => ruleAppliesToPackage(rule, packageToLint)),
                fileSystem,
                getLoggerForRule: loggers.getLoggerForRule,
            })
        );
        result.accumulate(
            await handleFileSystemDiffs({
                monorepo,
                packageToLint,
                fileSystem,
                logger: loggerForPackage,
                shouldFix,
            })
        );
        loggerForPackage.debug({
            message: "Done linting.",
        });
    }

    return result;
}

function partition<A, B>(items: readonly (A | B)[], predicate: (item: A | B) => item is A): [A[], B[]] {
    const aList: A[] = [];
    const bList: B[] = [];
    for (const item of items) {
        if (predicate(item)) {
            aList.push(item);
        } else {
            bList.push(item);
        }
    }
    return [aList, bList];
}

function ruleAppliesToPackage(rule: Rule.PackageRule, mrlintPackage: Package): boolean {
    return mrlintPackage.config.type != null && rule.targetedPackages.includes(mrlintPackage.config.type);
}
