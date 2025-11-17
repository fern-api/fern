import { Logger } from "@fern-api/logger";
import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext";

export interface InstallationMethod {
    type: "npm" | "pnpm" | "yarn" | "bun" | "brew" | "unknown";
    command: string;
}

async function detectInstallationMethod(logger: Logger): Promise<InstallationMethod> {
    const npmPath = process.env.npm_execpath;
    const npmConfigUserAgent = process.env.npm_config_user_agent;

    if (npmConfigUserAgent != null) {
        if (npmConfigUserAgent.includes("pnpm")) {
            return { type: "pnpm", command: "pnpm" };
        }
        if (npmConfigUserAgent.includes("yarn")) {
            return { type: "yarn", command: "yarn" };
        }
        if (npmConfigUserAgent.includes("bun")) {
            return { type: "bun", command: "bun" };
        }
        if (npmConfigUserAgent.includes("npm")) {
            return { type: "npm", command: "npm" };
        }
    }

    if (npmPath != null) {
        if (npmPath.includes("pnpm")) {
            return { type: "pnpm", command: "pnpm" };
        }
        if (npmPath.includes("yarn")) {
            return { type: "yarn", command: "yarn" };
        }
        if (npmPath.includes("bun")) {
            return { type: "bun", command: "bun" };
        }
    }

    const { stdout: whichFern, failed: whichFailed } = await loggingExeca(logger, "which", ["fern"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (!whichFailed && whichFern.trim()) {
        const fernPath = whichFern.trim();

        if (fernPath.includes("homebrew") || fernPath.includes("Homebrew") || fernPath.includes("/opt/homebrew")) {
            return { type: "brew", command: "brew" };
        }

        const { stdout: readlinkOutput, failed: readlinkFailed } = await loggingExeca(
            logger,
            "readlink",
            ["-f", fernPath],
            {
                doNotPipeOutput: true,
                reject: false
            }
        );

        if (!readlinkFailed && readlinkOutput.trim()) {
            const resolvedPath = readlinkOutput.trim();
            if (
                resolvedPath.includes("homebrew") ||
                resolvedPath.includes("Homebrew") ||
                resolvedPath.includes("/opt/homebrew")
            ) {
                return { type: "brew", command: "brew" };
            }
        }
    }

    const { failed: npmCheckFailed } = await loggingExeca(logger, "npm", ["list", "-g", "fern-api"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (!npmCheckFailed) {
        return { type: "npm", command: "npm" };
    }

    const { failed: pnpmCheckFailed } = await loggingExeca(logger, "pnpm", ["list", "-g", "fern-api"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (!pnpmCheckFailed) {
        return { type: "pnpm", command: "pnpm" };
    }

    const { failed: yarnCheckFailed } = await loggingExeca(logger, "yarn", ["global", "list"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (!yarnCheckFailed) {
        return { type: "yarn", command: "yarn" };
    }

    const { failed: bunCheckFailed } = await loggingExeca(logger, "bun", ["pm", "ls", "-g"], {
        doNotPipeOutput: true,
        reject: false
    });

    if (!bunCheckFailed) {
        return { type: "bun", command: "bun" };
    }

    return { type: "unknown", command: "" };
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
    version
}: {
    cliContext: CliContext;
    version: string | undefined;
}): Promise<void> {
    cliContext.logger.info("Detecting installation method...");

    const installationMethod = await detectInstallationMethod(cliContext.logger);

    if (installationMethod.type === "unknown") {
        return cliContext.failAndThrow(
            "Could not detect how Fern CLI was installed. Please manually update using your package manager (npm, pnpm, yarn, bun, or brew)."
        );
    }

    cliContext.logger.info(`Detected installation method: ${chalk.cyan(installationMethod.type)}`);

    const updateCommand = getUpdateCommand(installationMethod, version);

    if (updateCommand.length === 0) {
        return cliContext.failAndThrow(
            `Unable to construct update command for installation method: ${installationMethod.type}`
        );
    }

    const commandString = updateCommand.join(" ");
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
