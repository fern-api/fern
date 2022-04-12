import { Result, Rule, RuleType } from "@mrlint/commons";

type DependencyName = string;
type DependencyVersion = string;
type PackagePath = string;

export const DuplicateDependenciesRule: Rule.MonorepoRule = {
    ruleId: "duplicate-dependencies",
    type: RuleType.MONOREPO,
    run: runRule,
};

function runRule({ monorepo, logger }: Rule.MonorepoRuleRunnerArgs): Result {
    let result = Result.success();

    const dependenciesByName: Record<DependencyName, Record<DependencyVersion, PackagePath[]>> = {};
    for (const p of monorepo.packages) {
        addDependencies({
            packagePath: p.relativePath,
            dependencies: p.packageJson?.dependencies,
            dependenciesByName,
        });
        addDependencies({
            packagePath: p.relativePath,
            dependencies: p.packageJson?.devDependencies,
            dependenciesByName,
        });
    }

    for (const [dependency, versionToPackageNames] of Object.entries(dependenciesByName)) {
        const entries = Object.entries(versionToPackageNames);
        if (entries.length > 1) {
            result = Result.failure();
            logger.error({
                message: `Found multiple versions of ${dependency}`,
                additionalContent: entries
                    .map(([version, packageNames]) => `${version} (${packageNames.join(", ")})`)
                    .join("\n"),
            });
        }
    }

    return result;
}

function addDependencies({
    packagePath,
    dependencies,
    dependenciesByName,
}: {
    packagePath: PackagePath;
    dependencies: Record<string, string> | undefined;
    dependenciesByName: Record<DependencyName, Record<DependencyVersion, PackagePath[]>>;
}) {
    if (dependencies == null) {
        return;
    }

    for (const [dependency, version] of Object.entries(dependencies)) {
        let depsForPackage = dependenciesByName[dependency];
        if (depsForPackage == null) {
            depsForPackage = {};
            dependenciesByName[dependency] = depsForPackage;
        }
        let packagesForVersion = depsForPackage[version];
        if (packagesForVersion == null) {
            packagesForVersion = [];
            depsForPackage[version] = packagesForVersion;
        }
        packagesForVersion.push(packagePath);
    }
}
