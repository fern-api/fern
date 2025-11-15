import path from "path";
import fs from "fs";

const FERN_REPO_PACKAGE_NAME = "fern";

export interface CheckResult {
    success: boolean;
    error?: string;
}

export function isFernRepo(directoryPath: string): CheckResult {
    return isPackageRepoAtPath(directoryPath, FERN_REPO_PACKAGE_NAME);
}

export function isPackageRepoAtPath(directoryPath: string, packageName: string): CheckResult {
    const packageJsonPath = path.join(directoryPath, "package.json");

    const results: CheckResult = { success: true };

    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            if (pkg && pkg.name !== packageName) {
                results.error = `Package.json at ${packageJsonPath} does not have the correct name. Expected ${packageName} but got ${pkg.name}`;
                results.success = false;
            }
        } catch (err) {
            results.error = `Failed to read or parse package.json at ${packageJsonPath}: ${err}`;
            results.success = false;
        }
    }

    return results;
}