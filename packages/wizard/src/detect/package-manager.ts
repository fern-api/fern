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

export async function isFernCliInstalled(): Promise<string | null> {
    return new Promise((resolve) => {
        execFile("fern", ["--version"], { timeout: 5000 }, (error, stdout) => {
            if (error !== null) {
                resolve(null);
            } else {
                resolve(stdout.trim() || "unknown");
            }
        });
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
