import { execFile } from "child_process";
import { access } from "fs/promises";
import path from "path";
import type { PackageManager } from "../types";

export async function detectPackageManager(dir: string): Promise<PackageManager> {
    const lockfiles: Array<[string, PackageManager]> = [
        ["pnpm-lock.yaml", "pnpm"],
        ["yarn.lock", "yarn"],
        ["bun.lockb", "bun"],
        ["bun.lock", "bun"],
        ["package-lock.json", "npm"]
    ];
    for (const [lockfile, manager] of lockfiles) {
        if (await exists(path.join(dir, lockfile))) {
            return manager;
        }
    }
    return "npm";
}

export async function hasPackageJson(dir: string): Promise<boolean> {
    return exists(path.join(dir, "package.json"));
}

export async function isPnpmWorkspaceRoot(dir: string): Promise<boolean> {
    return exists(path.join(dir, "pnpm-workspace.yaml"));
}

export async function isFernCliInstalled(dir: string): Promise<string | null> {
    return new Promise((resolve) => {
        // Without FERN_NO_VERSION_REDIRECTION, `fern` re-executes the version pinned in a nearby
        // fern.config.json through npx, which can take long enough to look like a missing CLI.
        execFile(
            "fern",
            ["--version"],
            { cwd: dir, timeout: 15000, env: { ...process.env, FERN_NO_VERSION_REDIRECTION: "true" } },
            (error, stdout) => {
                if (error === null) {
                    resolve(stdout.trim() || "unknown");
                } else if (error.code === "ENOENT") {
                    resolve(null);
                } else {
                    // `fern` is on PATH but did not report a version; treat it as installed rather than reinstalling.
                    resolve("unknown");
                }
            }
        );
    });
}

async function exists(filePath: string): Promise<boolean> {
    try {
        await access(filePath);
        return true;
    } catch {
        return false;
    }
}
