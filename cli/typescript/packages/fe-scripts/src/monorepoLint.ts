import { RawManifest } from "@lerna/package";
import { getPackages, Project } from "@lerna/project";
import { readFile } from "fs/promises";
import { logError, PRIMARY_WRITER, SUCCESS_WRITER } from "./logger";
import { Result } from "./Result";
import { FilePath, LernaPackage, PackageName, PackageVersion } from "./types";
import { getPackagesByName } from "./utils";
import { writePackageFiles } from "./writePackageFiles";

const ROOT_PACKAGE_NAME = "root";

export async function monorepoLint({ shouldFix }: { shouldFix: boolean }): Promise<void> {
    logStartMessage({ shouldFix });
    const packages: LernaPackage[] = await getPackages();

    let result = Result.success();
    result = result.accumulate(await writeFilesForAllPackages(packages, { shouldFix }));
    result = result.accumulate(await validateDependencies(packages));
    if (!result.isSuccess) {
        process.exit(1);
    }
}

export function logStartMessage({ shouldFix }: { shouldFix: boolean }): void {
    const parts = [PRIMARY_WRITER("Linting")];
    if (shouldFix) {
        parts.push(SUCCESS_WRITER("(and fixing)"));
    }
    parts.push(PRIMARY_WRITER("monorepo..."));
    console.log(parts.join(" "));
}

async function writeFilesForAllPackages(
    packages: LernaPackage[],
    { shouldFix }: { shouldFix: boolean }
): Promise<Result> {
    let result = Result.success();

    const packagesByName = getPackagesByName(packages);
    for (const lernaPackage of packages) {
        result = result.accumulate(await writePackageFiles({ lernaPackage, packagesByName, shouldFix }));
    }

    return result;
}

async function validateDependencies(packages: LernaPackage[]): Promise<Result> {
    const dependenciesByName: Record<PackageName, Record<PackageVersion, PackageName[]>> = {};

    let result = Result.success();

    for (const lernaPackage of packages) {
        for (const dependency of Object.keys(lernaPackage.dependencies ?? {})) {
            if (dependency.startsWith("@types/")) {
                logError({
                    packageName: lernaPackage.name,
                    message: `Found unexpected dependency ${dependency}. This should be in devDependencies.`,
                });
            }
        }

        validateProjectDependencies({
            packageName: lernaPackage.name,
            dependenciesByName,
            dependencies: lernaPackage.dependencies,
        });
    }

    const { rootPath } = new Project();
    const rootPackageJson = await getPackageJson({ projectLocation: rootPath });
    if (rootPackageJson.dependencies != null) {
        logError({
            packageName: ROOT_PACKAGE_NAME,
            message: 'Found unexpected key "dependencies" in package.json',
        });
        result = Result.failure();
    }
    validateProjectDependencies({
        packageName: ROOT_PACKAGE_NAME,
        dependenciesByName,
        dependencies: rootPackageJson.devDependencies,
    });

    for (const [dependency, versionToPackageNames] of Object.entries(dependenciesByName)) {
        const entries = Object.entries(versionToPackageNames);
        if (entries.length > 1) {
            logError({
                packageName: undefined,
                message:
                    `Found multiple versions of ${dependency}\n` +
                    entries.map(([version, packageNames]) => `  ${version} (${packageNames.join(", ")})`).join("\n"),
            });
            result = Result.failure();
        }
    }

    return result;
}

function validateProjectDependencies({
    packageName,
    dependenciesByName,
    dependencies = {},
}: {
    packageName: string;
    dependenciesByName: Record<PackageName, Record<PackageVersion, PackageName[]>>;
    dependencies: Record<string, string> | undefined;
}): void {
    for (const [dependency, version] of Object.entries(dependencies)) {
        let versionToPackageNames = dependenciesByName[dependency];
        if (versionToPackageNames == null) {
            versionToPackageNames = {};
            dependenciesByName[dependency] = versionToPackageNames;
        }
        let packagesForVersion = versionToPackageNames[version];
        if (packagesForVersion == null) {
            packagesForVersion = [];
            versionToPackageNames[version] = packagesForVersion;
        }
        packagesForVersion.push(packageName);
    }
}

async function getPackageJson({ projectLocation }: { projectLocation: FilePath }): Promise<RawManifest> {
    const pathToPackageJson = `${projectLocation}/package.json`;
    const fileBuffer = await readFile(pathToPackageJson);
    return JSON.parse(fileBuffer.toString());
}
