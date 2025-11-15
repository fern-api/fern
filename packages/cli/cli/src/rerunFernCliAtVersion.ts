import { loggingExeca } from "@fern-api/logging-execa";
import chalk from "chalk";

import { CliContext } from "./cli-context/CliContext";
import { FERN_CWD_ENV_VAR } from "./cwd";
import { CacheEntry, VersionCache } from "./version-cache";

// Helper type for operation results
type OperationResult<T> = { success: true; data: T } | { success: false; reason: string };

export async function rerunFernCliAtVersion({
    version,
    cliContext,
    env
}: {
    version: string;
    cliContext: CliContext;
    env?: Record<string, string>;
}): Promise<void> {
    cliContext.suppressUpgradeMessage();

    const packageName = cliContext.environment.packageName;
    const args = process.argv.slice(2);

    cliContext.logger.debug(`Re-running CLI at version ${version}`);

    // Try using the version cache; on any error, fall back to using npx directly
    const cacheResult = await tryVersionCache(packageName, version, args, env, cliContext);
    if (cacheResult.success) {
        return;
    }

    cliContext.logger.debug(`Falling back to npx: ${cacheResult.reason}`);
    await executeViaNpx(packageName, version, args, env, cliContext);
}

async function tryVersionCache(
    packageName: string,
    version: string,
    args: string[],
    env: Record<string, string> | undefined,
    cliContext: CliContext
): Promise<OperationResult<void>> {
    if (isCachingDisabled()) {
        cliContext.logger.info(`${chalk.cyan("*")} Using Fern CLI v${version} (caching disabled)`);
        return { success: false, reason: "caching disabled" };
    }

    try {
        const versionCache = new VersionCache(cliContext.logger);
        const cacheEntry = await versionCache.getCachedVersion(packageName, version);

        if (cacheEntry) {
            return await executeFromCache(versionCache, cacheEntry, version, args, env, cliContext, "cached");
        } else {
            return await downloadAndExecute(versionCache, packageName, version, args, env, cliContext);
        }
    } catch (error) {
        return { success: false, reason: `version cache error: ${String(error)}` };
    }
}

async function executeFromCache(
    versionCache: VersionCache,
    cacheEntry: CacheEntry,
    version: string,
    args: string[],
    env: Record<string, string> | undefined,
    cliContext: CliContext,
    source: "cached" | "downloaded"
): Promise<OperationResult<void>> {
    const statusMessage =
        source === "cached"
            ? `${chalk.green("✓")} Using Fern CLI v${version} (cached)`
            : `${chalk.green("✓")} Fern CLI v${version} downloaded and cached successfully`;

    cliContext.logger.info(statusMessage);
    cliContext.logger.debug(`Using ${source} version ${version} from ${cacheEntry.path}`);

    try {
        const result = await versionCache.executeFromCache(cacheEntry, args, env);

        if (result.success) {
            return { success: true, data: undefined };
        } else {
            return { success: false, reason: `cache execution failed: ${result.stderr || "unknown error"}` };
        }
    } catch (error) {
        return { success: false, reason: `cache execution error: ${String(error)}` };
    }
}

async function downloadAndExecute(
    versionCache: VersionCache,
    packageName: string,
    version: string,
    args: string[],
    env: Record<string, string> | undefined,
    cliContext: CliContext
): Promise<OperationResult<void>> {
    cliContext.logger.info(`${chalk.yellow("→")} Using Fern CLI v${version} (downloading and caching...)`);
    cliContext.logger.debug(`Version ${version} not cached, downloading and caching`);

    try {
        const cacheEntry = await versionCache.cacheVersion(packageName, version);
        return await executeFromCache(versionCache, cacheEntry, version, args, env, cliContext, "downloaded");
    } catch (error) {
        return { success: false, reason: `failed to cache version: ${String(error)}` };
    }
}

async function executeViaNpx(
    packageName: string,
    version: string,
    args: string[],
    env: Record<string, string> | undefined,
    cliContext: CliContext
): Promise<void> {
    cliContext.logger.info(`${chalk.cyan("*")} Using Fern CLI v${version} (via npx)`);
    cliContext.logger.debug("Using npx fallback");

    const commandLineArgs = ["--quiet", "--yes", `${packageName}@${version}`, ...args];

    cliContext.logger.debug(
        [
            `Falling back to npx for version ${version}.`,
            `${chalk.dim(`+ npx ${commandLineArgs.map((arg) => `"${arg}"`).join(" ")}`)}`
        ].join("\n")
    );

    const { failed, stdout, stderr } = await loggingExeca(cliContext.logger, "npx", ["--quiet", ...commandLineArgs], {
        stdio: "inherit",
        reject: false,
        env: {
            ...env,
            [FERN_CWD_ENV_VAR]: process.env[FERN_CWD_ENV_VAR] ?? process.cwd()
        }
    });

    if (stdout.includes("code EEXIST") || stderr.includes("code EEXIST")) {
        // try again if there is a npx conflict
        return await rerunFernCliAtVersion({
            version,
            cliContext,
            env
        });
    }

    if (failed) {
        cliContext.failWithoutThrowing();
    }
}

function isCachingDisabled(): boolean {
    return process.env.FERN_NO_VERSION_CACHE === "true" || process.env.FERN_NO_VERSION_CACHE === "1";
}
