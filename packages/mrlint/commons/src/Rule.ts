import { FileSystem } from "@mrlint/virtual-file-system";
import { Logger } from "./logger/Logger";
import { Result } from "./Result";
import { Monorepo, Package, PackageType } from "./types";

export type Rule = Rule.MonorepoRule | Rule.PackageRule;

export enum RuleType {
    MONOREPO = "MONOREPO",
    PACKAGE = "PACKAGE",
}

export declare namespace Rule {
    /**
     * a rule that applies to the entire monorepo.
     * it is run once.
     */
    export interface MonorepoRule extends BaseRule {
        type: RuleType.MONOREPO;
        run: Runner<MonorepoRuleRunnerArgs>;
    }

    export interface MonorepoRuleRunnerArgs {
        monorepo: Monorepo;
        fileSystems: FileSystems;
        logger: Logger;
    }

    /**
     * a rule that applies to a package.
     * it is run once per package.
     */
    export interface PackageRule extends BaseRule {
        type: RuleType.PACKAGE;
        targetedPackages: PackageType[];
        run: Runner<PackageRuleRunnerArgs>;
    }

    export interface PackageRuleRunnerArgs {
        packageToLint: Package;
        allPackages: readonly Package[];
        relativePathToRoot: string;
        relativePathToSharedConfigs: string;
        fileSystems: FileSystems;
        logger: Logger;
    }

    interface Issue {
        severity: "warning" | "error";
        summary: string;
    }

    export interface BaseRule {
        ruleId: string;
        docs?: string;
    }

    export type Runner<Args> = (args: Args) => Result | Promise<Result>;

    export interface FileSystems {
        getFileSystemForMonorepo: () => FileSystem;
        getFileSystemForPackage: (package: Package) => FileSystem;
    }
}
