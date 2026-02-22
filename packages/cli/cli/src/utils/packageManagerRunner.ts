import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";

/**
 * Represents a package manager runner that can execute one-off packages
 * (equivalent to npx for npm).
 */
export interface PackageManagerRunner {
    /** The type of package manager */
    type: "npm" | "pnpm" | "yarn" | "bun" | "vlt";
    /** The command to execute (e.g., "npx", "pnpm", "bunx") */
    command: string;
    /**
     * Build the full argument list for running a package at a specific version.
     * @param packageAtVersion - The package specifier, e.g. "fern-api@1.2.3"
     * @param args - Additional arguments to pass to the package
     * @returns The full argument list to pass to the command
     */
    buildArgs(packageAtVersion: string, args: string[]): string[];
    /** Human-readable label for log messages */
    label: string;
}

const RUNNERS: PackageManagerRunner[] = [
    {
        type: "npm",
        command: "npx",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["--quiet", "--yes", packageAtVersion, ...args];
        },
        label: "npx (npm)"
    },
    {
        type: "pnpm",
        command: "pnpm",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["dlx", packageAtVersion, ...args];
        },
        label: "pnpm dlx"
    },
    {
        type: "yarn",
        command: "yarn",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["dlx", packageAtVersion, ...args];
        },
        label: "yarn dlx"
    },
    {
        type: "bun",
        command: "bunx",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return [packageAtVersion, ...args];
        },
        label: "bunx (bun)"
    },
    {
        type: "vlt",
        command: "vlt",
        buildArgs(packageAtVersion: string, args: string[]): string[] {
            return ["exec", packageAtVersion, "--", ...args];
        },
        label: "vlt exec"
    }
];

/**
 * Check if a command exists on the system.
 */
async function commandExists(logger: Logger, command: string): Promise<boolean> {
    const isWindows = process.platform === "win32";
    const whichCommand = isWindows ? "where" : "which";

    const { failed } = await loggingExeca(logger, whichCommand, [command], {
        doNotPipeOutput: true,
        reject: false
    });

    return !failed;
}

/**
 * Detect the first available package manager runner on the system.
 *
 * Checks in order: npx, pnpm, yarn, bunx, vlt.
 * Returns the first runner whose command is found on PATH.
 *
 * @param logger - Logger instance for debug output
 * @returns The detected runner, or undefined if none are available
 */
export async function detectPackageManagerRunner(logger: Logger): Promise<PackageManagerRunner | undefined> {
    for (const runner of RUNNERS) {
        logger.debug(`Checking for ${runner.label} (${runner.command})...`);
        const exists = await commandExists(logger, runner.command);
        if (exists) {
            logger.debug(`Found ${runner.label}`);
            return runner;
        }
        logger.debug(`${runner.label} not found`);
    }
    return undefined;
}

/**
 * Returns all defined runners (useful for testing and error messages).
 */
export function getAllRunners(): readonly PackageManagerRunner[] {
    return RUNNERS;
}
