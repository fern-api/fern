import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";
import { realpath } from "fs/promises";
import { dirname } from "path";
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
    const { stdout: whichFern, failed: whichFailed } = await loggingExeca(logger, "which", ["fern"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (whichFailed || !whichFern.trim()) {
        return { type: "unknown", command: "" };
    }

    const fernPath = whichFern.trim();
    logger.debug(`Found fern at: ${fernPath}`);

    let resolvedPath: string;
    try {
        resolvedPath = await realpath(fernPath);
        logger.debug(`Resolved to: ${resolvedPath}`);
    } catch (error) {
        logger.debug(`Failed to resolve symlink: ${error}`);
        resolvedPath = fernPath;
    }

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

    const fernDir = dirname(resolvedPath);
    logger.debug(`fern directory: ${fernDir}`);

    const packageManagers: Array<"pnpm" | "yarn" | "bun" | "npm"> = ["pnpm", "yarn", "bun", "npm"];

    for (const pm of packageManagers) {
        const binDir = await getPackageManagerBinDir(logger, pm);
        if (binDir != null) {
            logger.debug(`${pm} bin dir: ${binDir}`);
            if (fernDir === binDir || fernDir.startsWith(binDir + "/")) {
                return {
                    type: pm,
                    command: pm,
                    detectedPath: fernPath,
                    resolvedPath
                };
            }
        }
    }

    if (resolvedPath.includes(".pnpm") || resolvedPath.includes("pnpm-global") || resolvedPath.includes("/pnpm/")) {
        return {
            type: "pnpm",
            command: "pnpm",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    if (resolvedPath.includes("/.yarn/") || resolvedPath.includes("/yarn/")) {
        return {
            type: "yarn",
            command: "yarn",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    if (resolvedPath.includes("/.bun/") || resolvedPath.includes("/bun/")) {
        return {
            type: "bun",
            command: "bun",
            detectedPath: fernPath,
            resolvedPath
        };
    }

    if (resolvedPath.includes("/lib/node_modules/")) {
        return {
            type: "npm",
            command: "npm",
            detectedPath: fernPath,
            resolvedPath
        };
    }

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
            if (version != null) {
                return ["brew", "upgrade", "fern-api"];
            }
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
        errorMessage += "\nPlease manually update using your package manager (npm, pnpm, yarn, bun, or brew).";
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
