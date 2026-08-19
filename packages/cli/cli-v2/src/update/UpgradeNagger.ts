import chalk from "chalk";
import type { Context } from "../context/Context.js";
import { Icons } from "../ui/format.js";
import { createUpdateCheckTracker, createUpdateService } from "./createUpdateService.js";
import { isUpgradeAvailable } from "./UpdateService.js";

/**
 * Best-effort, fire-and-forget probe that nags the user when a newer CLI
 * is available on the release feed.
 *
 * Constraints:
 * - Only runs when stdout is a TTY (CI runs stay quiet).
 * - Persists the last check timestamp in the cache so the probe runs at
 *   most once per `intervalMs` (default 24h).
 * - Never throws — any network/parse error is silently swallowed.
 * - Self-suppresses when the user is running `fern update` (no point nagging
 *   them mid-update).
 */
const COMMANDS_TO_SKIP = new Set(["update", "telemetry", "completion"]);

/**
 * Run a (possibly cached) probe and print a short nag if a newer version
 * exists. Safe to await on the hot path — never throws.
 */
export async function maybeNag(context: Context): Promise<void> {
    try {
        if (!context.isTTY) {
            return;
        }
        if (process.env.FERN_DISABLE_UPGRADE_CHECK === "1") {
            return;
        }
        if (COMMANDS_TO_SKIP.has(context.info.command)) {
            return;
        }

        const tracker = createUpdateCheckTracker(context);
        const shouldCheck = await tracker.shouldCheck();
        if (!shouldCheck) {
            const cached = await tracker.read();
            if (cached?.latestVersion != null) {
                const service = createUpdateService(context);
                printIfUpgradeAvailable(context, service.currentVersion, cached.latestVersion);
            }
            return;
        }

        const service = createUpdateService(context);
        const result = await service.checkLatest();
        await tracker.recordCheck({ latestVersion: result.latestVersion });
        if (result.isUpgradeAvailable) {
            printIfUpgradeAvailable(context, result.currentVersion, result.latestVersion);
        }
    } catch {
        // Never let the upgrade check surface as a user-visible failure.
    }
}

/**
 * Print a one-line nag when the latest version is strictly newer than the
 * currently running one. Exposed for testing.
 */
export function printIfUpgradeAvailable(context: Context, currentVersion: string, latestVersion: string): void {
    if (!isUpgradeAvailable(currentVersion, latestVersion)) {
        return;
    }
    context.stderr.info("");
    context.stderr.info(
        `${Icons.info} A newer fern is available: ${chalk.cyan(latestVersion)} (current: ${chalk.dim(currentVersion)})`
    );
    context.stderr.info(`  Run ${chalk.bold("fern update")} to install it.`);
}
