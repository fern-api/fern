import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";
import fs from "fs";
import { homedir } from "os";
import path from "path";

import { CliContext } from "./cli-context/CliContext.js";
import { FERN_CWD_ENV_VAR } from "./cwd.js";

export class RerunCliError extends Error {
    public readonly stdout: string;
    public readonly stderr: string;
    public readonly version: string;

    constructor({ version, stdout, stderr }: { version: string; stdout: string; stderr: string }) {
        super(`Failed to rerun CLI at version ${version}`);
        this.name = "RerunCliError";
        this.version = version;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}

function getCachedCliEntryPoint(packageName: string, version: string): string {
    return path.join(homedir(), ".fern", "versions", version, "node_modules", packageName, "cli.cjs");
}

function getCachedCliDir(version: string): string {
    return path.join(homedir(), ".fern", "versions", version);
}

async function ensureCachedCli({
    packageName,
    version,
    cliContext
}: {
    packageName: string;
    version: string;
    cliContext: CliContext;
}): Promise<string | undefined> {
    const entryPoint = getCachedCliEntryPoint(packageName, version);

    // Check if already cached
    if (fs.existsSync(entryPoint)) {
        cliContext.logger.debug(`Using cached CLI at ${entryPoint}`);
        return entryPoint;
    }

    // Install into cache directory
    const cacheDir = getCachedCliDir(version);
    fs.mkdirSync(cacheDir, { recursive: true });

    cliContext.logger.debug(`Installing ${packageName}@${version} into cache at ${cacheDir}...`);

    try {
        // Write a minimal package.json so npm install works
        const packageJsonPath = path.join(cacheDir, "package.json");
        if (!fs.existsSync(packageJsonPath)) {
            fs.writeFileSync(packageJsonPath, JSON.stringify({ private: true }), "utf-8");
        }

        const { failed } = await loggingExeca(
            cliContext.logger,
            "npm",
            ["install", "--prefer-offline", `${packageName}@${version}`],
            {
                cwd: cacheDir,
                reject: false,
                doNotPipeOutput: true
            }
        );

        if (failed || !fs.existsSync(entryPoint)) {
            cliContext.logger.debug("Failed to install CLI into cache, falling back to npx");
            return undefined;
        }

        return entryPoint;
    } catch {
        cliContext.logger.debug("Failed to cache CLI, falling back to npx");
        return undefined;
    }
}

export async function rerunFernCliAtVersion({
    version,
    cliContext,
    env,
    args,
    throwOnError = false
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
    args?: string[];
    throwOnError?: boolean;
}): Promise<void> {
    cliContext.suppressUpgradeMessage();

    const cliArgs = args ?? process.argv.slice(2);
    const envVars = {
        ...env,
        [FERN_CWD_ENV_VAR]: process.env[FERN_CWD_ENV_VAR] ?? process.cwd(),
        FERN_NO_VERSION_REDIRECTION: "true"
    };

    // Try to use cached CLI first
    const cachedEntryPoint = await ensureCachedCli({
        packageName: cliContext.environment.packageName,
        version,
        cliContext
    });

    if (cachedEntryPoint != null) {
        cliContext.logger.debug(
            [
                `Re-running CLI at version ${version} (cached).`,
                `${chalk.dim(`+ node ${cachedEntryPoint} ${cliArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
            ].join("\n")
        );

        const { failed, stdout, stderr } = await loggingExeca(
            cliContext.logger,
            "node",
            [cachedEntryPoint, ...cliArgs],
            {
                stdio: "inherit",
                reject: false,
                env: envVars
            }
        );

        if (failed) {
            if (throwOnError) {
                throw new RerunCliError({ version, stdout, stderr });
            }
            cliContext.failWithoutThrowing();
        }
        return;
    }

    // Fallback to npx
    const commandLineArgs = ["--quiet", "--yes", `${cliContext.environment.packageName}@${version}`, ...cliArgs];
    cliContext.logger.debug(
        [
            `Re-running CLI at version ${version}.`,
            `${chalk.dim(`+ npx ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
        ].join("\n")
    );

    const { failed, stdout, stderr } = await loggingExeca(cliContext.logger, "npx", commandLineArgs, {
        stdio: "inherit",
        reject: false,
        env: envVars
    });
    if (stdout.includes("code EEXIST") || stderr.includes("code EEXIST")) {
        // try again if there is a npx conflict
        return await rerunFernCliAtVersion({
            version,
            cliContext,
            env,
            args,
            throwOnError
        });
    }

    if (failed) {
        if (throwOnError) {
            throw new RerunCliError({ version, stdout, stderr });
        }
        cliContext.failWithoutThrowing();
    }
}
