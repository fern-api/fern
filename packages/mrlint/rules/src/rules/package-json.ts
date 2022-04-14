import { Logger, Package, PackageType, Result, Rule, RuleType } from "@mrlint/commons";
import produce from "immer";
import { IPackageJson } from "package-json-type";
import path from "path";
import { Executable, EXECUTABLES, Executables, RequiredDependency } from "../utils/Executables";
import { tryGetPackageJson } from "../utils/tryGetPackageJson";

const PRODUCTION_ENVIRONMENT_ENV_VAR = "REACT_APP_PRODUCTION_ENVIRONMENT";

export const PackageJsonRule: Rule.PackageRule = {
    ruleId: "package-json",
    type: RuleType.PACKAGE,
    targetedPackages: [
        PackageType.REACT_APP,
        PackageType.REACT_LIBRARY,
        PackageType.TYPESCRIPT_LIBRARY,
        PackageType.TYPESCRIPT_CLI,
    ],
    run: runRule,
};

async function runRule({
    fileSystems,
    relativePathToRoot,
    relativePathToSharedConfigs,
    packageToLint,
    logger,
}: Rule.PackageRuleRunnerArgs): Promise<Result> {
    const result = Result.success();

    const executables = new Executables();

    let packageJson: IPackageJson;
    try {
        packageJson = generatePackageJson({
            packageToLint,
            relativePathToRoot,
            relativePathToSharedConfigs,
            logger,
            executables,
        });
    } catch (error) {
        logger.error({
            message: "Failed to generate package.json",
            error,
        });
        return Result.failure();
    }

    const fileSystemForPackage = fileSystems.getFileSystemForPackage(packageToLint);
    await fileSystemForPackage.writeFile("package.json", JSON.stringify(packageJson));

    // warn about missing deps
    for (const requiredDependency of executables.getRequiredDependencies()) {
        result.accumulate(
            checkDependencyForExecutable({
                requiredDependency,
                packageJson,
                logger,
            })
        );
    }

    return result;
}

function generatePackageJson({
    packageToLint,
    relativePathToRoot,
    relativePathToSharedConfigs,
    logger,
    executables,
}: {
    packageToLint: Package;
    relativePathToRoot: string;
    relativePathToSharedConfigs: string;
    logger: Logger;
    executables: Executables;
}): IPackageJson {
    const oldPackageJson = tryGetPackageJson(packageToLint, logger);
    if (oldPackageJson == null) {
        throw new Error("Missing package.json");
    }
    if (oldPackageJson.version == null) {
        throw new Error("Missing 'version' in package.json");
    }

    const pathToEslintIgnore = path.join(relativePathToRoot, ".eslintignore");
    const pathToPrettierIgnore = path.join(relativePathToSharedConfigs, ".prettierignore");

    const packageJson = produce<IPackageJson>({}, (draft) => {
        draft.name = oldPackageJson.name;
        draft.version = oldPackageJson.version;
        if (packageToLint.config.private) {
            draft.private = true;
        }
        draft.main = "lib/index.js";
        draft.types = "lib/index.d.ts";
        draft.files = ["lib"];

        if (packageToLint.config.type === PackageType.TYPESCRIPT_CLI) {
            const packageNameWithoutScope = oldPackageJson.name.slice(oldPackageJson.name.indexOf("/") + 1);
            draft.bin = {
                [packageNameWithoutScope]: "./cli",
            };
        }

        draft.scripts = {
            clean: `${executables.get(Executable.TSC)} --build --clean`,
            compile: `${executables.get(Executable.TSC)} --build`,
            test: `${executables.get(Executable.JEST)} --passWithNoTests`,
            "lint:eslint": `${executables.get(
                Executable.ESLINT
            )} --max-warnings 0 . --ignore-path=${pathToEslintIgnore}`,
            "lint:eslint:fix": `${executables.get(
                Executable.ESLINT
            )} --max-warnings 0 . --ignore-path=${pathToEslintIgnore} --fix`,
            "lint:style": `${executables.get(Executable.STYLELINT)} '**/*.scss' --allow-empty-input --max-warnings 0`,
            "lint:style:fix": `${executables.get(
                Executable.STYLELINT
            )} '**/*.scss' --allow-empty-input --max-warnings 0 --fix`,
            format: `${executables.get(
                Executable.PRETTIER
            )} --write --ignore-unknown --ignore-path ${pathToPrettierIgnore} "**"`,
            "format:check": `${executables.get(
                Executable.PRETTIER
            )} --check --ignore-unknown --ignore-path ${pathToPrettierIgnore} "**"`,
            depcheck: executables.get(Executable.DEPCHECK),
            prepublish:
                "run clean && run compile && run test && run lint:eslint && run lint:style && run format:check && run depcheck",
        };

        if (packageToLint.config.type === PackageType.REACT_APP) {
            draft.scripts = {
                ...draft.scripts,
                start: `${executables.get(Executable.ENV_CMD)} -e development ${executables.get(
                    Executable.ENV_CMD
                )} -f .env.local --silent craco start`,
                "build:staging": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=STAGING ${executables.get(
                    Executable.ENV_CMD
                )} -e development craco --max_old_space_size=4096 build`,
                "build:production": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=PRODUCTION ${executables.get(
                    Executable.ENV_CMD
                )} -e production craco --max_old_space_size=4096 build`,
                "deploy:staging": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=STAGING ${executables.get(
                    Executable.AWS_CDK
                )} deploy --output deploy/cdk.out --require-approval never --progress events`,
                "deploy:production": `${PRODUCTION_ENVIRONMENT_ENV_VAR}=PRODUCTION ${executables.get(
                    Executable.AWS_CDK
                )} deploy --output deploy/cdk.out --require-approval never --progress events`,
                eject: `${executables.get(Executable.REACT_SCRIPTS)} eject`,
            };
            draft.browserslist = {
                production: [">0.2%", "not dead", "not op_mini all"],
                development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
            };
        }

        if (oldPackageJson.dependencies != null) {
            draft.dependencies = sortDependencies(oldPackageJson.dependencies);
        }
        if (oldPackageJson.devDependencies != null) {
            draft.devDependencies = sortDependencies(oldPackageJson.devDependencies);
        }

        if (
            canPackageContainCss(packageToLint) &&
            getDependencies(packageJson.dependencies).some((d) => d.startsWith("@blueprintjs/"))
        ) {
            draft.postcss = {
                "postcss-modules": {
                    globalModulePaths: ["@blueprintjs.*"],
                },
            };
        }
    });

    return packageJson;
}

function sortDependencies(dependencies: Record<string, string>): Record<string, string> {
    return Object.keys(dependencies)
        .sort()
        .reduce(
            (all, key) => ({
                ...all,
                [key]: dependencies?.[key],
            }),
            {}
        );
}

function canPackageContainCss(p: Package): boolean {
    if (p.config.type == null) {
        return false;
    }
    switch (p.config.type) {
        case PackageType.REACT_APP:
        case PackageType.REACT_LIBRARY:
            return true;
        case PackageType.TYPESCRIPT_CLI:
        case PackageType.TYPESCRIPT_LIBRARY:
            return false;
    }
}

function getDependencies(dependencies: Record<string, string> | undefined): string[] {
    if (dependencies == null) {
        return [];
    }
    return Object.keys(dependencies);
}

function checkDependencyForExecutable({
    requiredDependency,
    packageJson,
    logger,
}: {
    requiredDependency: RequiredDependency;
    packageJson: IPackageJson;
    logger: Logger;
}): Result {
    const allDependencies = new Set([
        ...getDependencies(packageJson.dependencies),
        ...getDependencies(packageJson.devDependencies),
    ]);

    if (!allDependencies.has(requiredDependency.dependency)) {
        logger.error({
            message: `${
                requiredDependency.dependency
            } is not listed as a dependency in package.json, but is required for ${
                EXECUTABLES[requiredDependency.executable]
            }`,
        });
        return Result.failure();
    }

    return Result.success();
}
