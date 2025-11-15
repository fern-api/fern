import path from "path";
import fs from "fs";
import { FERN_REPO_PACKAGE_NAME } from "./constants";


export type CheckResult = CheckResultSuccess | CheckResultFailure;
export interface CheckResultSuccess {
    success: true;
}
export interface CheckResultFailure {
    success: false;
    error: string;
}

export function isFernRepo(directoryPath: string): CheckResult {
    return isPackageRepoAtPath(directoryPath, FERN_REPO_PACKAGE_NAME);
}

export async function isLocalFernCliBuilt(directoryPath: string): Promise<CheckResult> {
    const cliPath = path.join(directoryPath, "packages", "cli", "cli", "dist", "prod", "cli.cjs");
    if (!fs.existsSync(cliPath)) {
        return { success: false, error: `Local Fern CLI at ${cliPath} does not exist. Please build the local Fern CLI by running 'pnpm fern:build'` };
    }
    return { success: true };
}

export function isPackageRepoAtPath(directoryPath: string, packageName: string): CheckResult {
    const packageJsonPath = path.join(directoryPath, "package.json");

    if (fs.existsSync(packageJsonPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
            if (pkg && pkg.name !== packageName) {
                return { success: false, error: `Package.json at ${packageJsonPath} does not have the correct name. Expected ${packageName} but got ${pkg.name}` };
            }
        } catch (err) {
            return { success: false, error: `Failed to read or parse package.json at ${packageJsonPath}: ${err}` };
        }
    }
    return { success: true };
}