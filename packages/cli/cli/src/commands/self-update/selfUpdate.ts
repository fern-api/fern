import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";
import { realpath } from "fs/promises";
import { dirname, normalize, sep } from "path";
import { CliContext } from "../../cli-context/CliContext";

export interface InstallationMethod {
    type: "npm" | "pnpm" | "yarn" | "bun" | "brew" | "unknown";
    command: string;
    detectedPath?: string;
    resolvedPath?: string;
}

async function getPackageManagerBinDir(logger: Logger, pm: "npm" | "pnpm" | "yarn" | "bun"): Promise<string | null> {
    let command: string;
    let args: string[];

    switch (pm) {
        case "npm":
            command = "npm";
            args = ["bin", "-g"];
            break;
        case "pnpm":
            command = "pnpm";
            args = ["bin", "-g"];
            break;
        case "yarn":
            command = "yarn";
            args = ["global", "bin"];
            break;
        case "bun":
            command = "bun";
            args = ["pm", "bin", "-g"];
            break;
    }

    const { stdout, failed } = await loggingExeca(logger, command, args, {
        doNotPipeOutput: true,
        reject: false
    });

    if (failed || !stdout.trim()) {
        return null;
    }

    return stdout.trim();
}

async function detectInstallationMethod(logger: Logger): Promise<InstallationMethod> {
    // Use cross-platform command: 'where' on Windows, 'which' on Unix
    const isWindows = process.platform === "win32";
    const whichCommand = isWindows ? "where" : "which";

    const { stdout: whichFern, failed: whichFailed } = await loggingExeca(logger, whichCommand, ["fern"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (whichFailed || !whichFern.trim()) {
        return { type: "unknown", command: "" };
    }

    // On Windows, 'where' may return multiple paths - take the first one
    const fernPath = whichFern.trim().split(/\r?\n/)[0] ?? whichFern.trim();
    logger.debug(`Found fern at: ${fernPath}`);

    let resolvedPath: string;
    try {
        resolvedPath = await realpath(fernPath);
        logger.debug(`Resolved to: ${resolvedPath}`);
    } catch (error) {
        logger.debug(`Failed to resolve symlink: ${error}`);
        resolvedPath = fernPath;
    }

    // Homebrew detection (macOS/Linux only)
    if (process.platform !== "win32") {
        if (
            resolvedPath.includes("/Cellar/") ||
            resolvedPath.includes("/Homebrew/") ||
            resolvedPath.includes("/opt/homebrew/") ||
            resolvedPath.includes("/usr/local/Cellar/")
        ) {
            const { failed: brewCheckFailed } = await loggingExeca(logger, "brew", ["list", "--versions", "fern-api"], {
                doNotPipeOutput: true,
                reject: false
            });

            if (!brewCheckFailed) {
                return {
                    type: "brew",
                    command: "brew",
                    detectedPath: fernPath,
                    resolvedPath
                };
            }

            const { failed: brewCheckFernFailed } = await loggingExeca(logger, "brew", ["list", "--versions", "fern"], {
                doNotPipeOutput: true,
                reject: false
            });

            if (!brewCheckFernFailed) {
                return {
                    type: "brew",
                    command: "brew",
                    detectedPath: fernPath,
                    resolvedPath
                };
            }
        }
    }

    const fernDir = dirname(resolvedPath);
    logger.debug(`fern directory: ${fernDir}`);

    const packageManagers: Array<"pnpm" | "yarn" | "bun" | "npm"> = ["pnpm", "yarn", "bun", "npm"];

    for (const pm of packageManagers) {
        const binDir = await getPackageManagerBinDir(logger, pm);
        if (binDir != null) {
            logger.debug(`${pm} bin dir: ${binDir}`);
            // Normalize paths for cross-platform comparison
            const normalizedFernDir = normalize(fernDir);
            const normalizedBinDir = normalize(binDir);
            // Check both forward and backward slash variants for cross-platform compatibility
            if (
                normalizedFernDir === normalizedBinDir ||
                normalizedFernDir.startsWith(normalizedBinDir + sep) ||
                normalizedFernDir.startsWith(normalizedBinDir + "/") ||
                normalizedFernDir.startsWith(normalizedBinDir + "\\")
            ) {
                return {
                    type: pm,
                    command: pm,
                    detectedPath: fernPath,
                    resolvedPath
                };
            }
        }
    }

    // Fallback: Check for common path patterns (normalized for cross-platform)
    // Use both forward and backward slashes for compatibility
    const normalizedPath = normalize(resolvedPath);

    if (
        normalizedPath.includes(".pnpm") ||
        normalizedPath.includes("pnpm-global") ||
        normalizedPath.includes(`${sep}pnpm${sep}`) ||
        normalizedPath.includes("/pnpm/") ||
        normalizedPath.includes("\\pnpm\\")
    ) {
        return {
            type: "pnpm",
            command: "pnpm",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    if (
        normalizedPath.includes(`${sep}.yarn${sep}`) ||
        normalizedPath.includes(`${sep}yarn${sep}`) ||
        normalizedPath.includes("/.yarn/") ||
        normalizedPath.includes("/yarn/") ||
        normalizedPath.includes("\\.yarn\\") ||
        normalizedPath.includes("\\yarn\\")
    ) {
        return {
            type: "yarn",
            command: "yarn",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    if (
        normalizedPath.includes(`${sep}.bun${sep}`) ||
        normalizedPath.includes(`${sep}bun${sep}`) ||
        normalizedPath.includes("/.bun/") ||
        normalizedPath.includes("/bun/") ||
        normalizedPath.includes("\\.bun\\") ||
        normalizedPath.includes("\\bun\\")
    ) {
        return {
            type: "bun",
            command: "bun",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    if (
        normalizedPath.includes(`${sep}lib${sep}node_modules${sep}`) ||
        normalizedPath.includes(`${sep}node_modules${sep}`) ||
        normalizedPath.includes("/lib/node_modules/") ||
        normalizedPath.includes("/node_modules/") ||
        normalizedPath.includes("\\lib\\node_modules\\") ||
        normalizedPath.includes("\\node_modules\\")
    ) {
        return {
            type: "npm",
            command: "npm",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    // Log diagnostic information about why detection failed
    logger.debug("Installation method detection failed:");
    if (process.platform !== "win32") {
        logger.debug(`  - Not installed via Homebrew (no Cellar/Homebrew path)`);
    }
    logger.debug(`  - Package manager bin directories checked: pnpm, yarn, bun, npm (none matched)`);
    logger.debug(
        `  - Path patterns checked: .pnpm, pnpm-global, ${sep}pnpm${sep}, .yarn, ${sep}yarn${sep}, .bun, ${sep}bun${sep}, ${sep}node_modules${sep}`
    );
    logger.debug(`  - Resolved path: ${resolvedPath}`);
    logger.debug(`  - Directory: ${fernDir}`);

    return {
        type: "unknown",
        command: "",
        detectedPath: fernPath,
        resolvedPath
    };
}

function getUpdateCommand(method: InstallationMethod, version: string | undefined): string[] {
    const packageSpec = version != null ? `fern-api@${version}` : "fern-api@latest";

    switch (method.type) {
        case "npm":
            return ["npm", "install", "-g", packageSpec];
        case "pnpm":
            return ["pnpm", "add", "-g", packageSpec];
        case "yarn":
            return ["yarn", "global", "add", packageSpec];
        case "bun":
            return ["bun", "install", "-g", packageSpec];
        case "brew":
            // Homebrew doesn't support versioned upgrades, always upgrade to latest
            return ["brew", "upgrade", "fern-api"];
        default:
            return [];
    }
}

export async function selfUpdate({
    cliContext,
    version,
    dryRun
}: {
    cliContext: CliContext;
    version: string | undefined;
    dryRun?: boolean;
}): Promise<void> {
    cliContext.logger.info("Detecting installation method...");

    const installationMethod = await detectInstallationMethod(cliContext.logger);

    if (installationMethod.type === "unknown") {
        let errorMessage = "Could not detect how Fern CLI was installed.";
        if (installationMethod.detectedPath != null) {
            errorMessage += `\nFound fern at: ${installationMethod.detectedPath}`;
            if (
                installationMethod.resolvedPath != null &&
                installationMethod.resolvedPath !== installationMethod.detectedPath
            ) {
                errorMessage += `\nResolved to: ${installationMethod.resolvedPath}`;
            }
        }
        errorMessage += "\n\nPlease manually update using your package manager (npm, pnpm, yarn, bun, or brew).";
        errorMessage += "\nFor more diagnostic information, run with: FERN_LOG_LEVEL=debug fern self-update";
        return cliContext.failAndThrow(errorMessage);
    }

    cliContext.logger.info(`Detected installation method: ${chalk.cyan(installationMethod.type)}`);
    if (installationMethod.detectedPath != null) {
        cliContext.logger.debug(`Found fern at: ${installationMethod.detectedPath}`);
    }
    if (
        installationMethod.resolvedPath != null &&
        installationMethod.resolvedPath !== installationMethod.detectedPath
    ) {
        cliContext.logger.debug(`Resolved to: ${installationMethod.resolvedPath}`);
    }

    const updateCommand = getUpdateCommand(installationMethod, version);

    if (updateCommand.length === 0) {
        return cliContext.failAndThrow(
            `Unable to construct update command for installation method: ${installationMethod.type}`
        );
    }

    if (installationMethod.type === "brew" && version != null) {
        cliContext.logger.warn(
            chalk.yellow(
                `Warning: Homebrew does not support versioned upgrades. Upgrading to the latest version instead.`
            )
        );
    }

    const commandString = updateCommand.join(" ");

    if (dryRun === true) {
        cliContext.logger.info(chalk.yellow("Dry run mode - no changes will be made"));
        cliContext.logger.info(`Would run: ${chalk.cyan(commandString)}`);
        return;
    }

    cliContext.logger.info(`Running: ${chalk.dim(commandString)}`);

    const [command, ...args] = updateCommand;
    if (command == null) {
        return cliContext.failAndThrow("Invalid update command");
    }

    const { failed, stderr } = await loggingExeca(cliContext.logger, command, args, {
        doNotPipeOutput: false,
        reject: false
    });

    if (failed) {
        cliContext.logger.error(`Failed to update Fern CLI: ${stderr}`);
        return cliContext.failAndThrow("Update failed. Please try updating manually.");
    }

    cliContext.logger.info(chalk.green("✓ Fern CLI updated successfully!"));
}
