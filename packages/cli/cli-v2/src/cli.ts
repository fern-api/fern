import { getOrCreateFernRunId } from "@fern-api/cli-telemetry";
import { spawnSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import type { Argv } from "yargs";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { addApiCommand } from "./commands/api/index.js";
import { addAuthCommand } from "./commands/auth/index.js";
import { addCacheCommand } from "./commands/cache/index.js";
import { addCheckCommand } from "./commands/check/index.js";
import { addConfigCommand } from "./commands/config/index.js";
import { addDocsCommand } from "./commands/docs/index.js";
import { addInitCommand } from "./commands/init/index.js";
import { addOrgCommand } from "./commands/org/index.js";
import { addReplayCommand } from "./commands/replay/index.js";
import { addSdkCommand } from "./commands/sdk/index.js";
import { addTelemetryCommand } from "./commands/telemetry/index.js";
import { isCompletionMode } from "./completion.js";
import { GlobalArgs } from "./context/GlobalArgs.js";
import { Version } from "./version.js";

/**
 * Path to the tiny completion helper binary bundled alongside this CLI.
 * Falls back to undefined when running from source (ts-node / vitest).
 */
function resolveCompletionHelperPath(): string | undefined {
    try {
        const dir = dirname(fileURLToPath(import.meta.url));
        const candidate = join(dir, "complete.cjs");
        return existsSync(candidate) ? candidate : undefined;
    } catch {
        return undefined;
    }
}

export async function runCliV2(argv?: string[]): Promise<void> {
    // Skip telemetry setup during shell completion so TAB stays fast
    // and side-effect-free.
    if (!isCompletionMode(argv)) {
        getOrCreateFernRunId();
    }
    const cli = createCliV2(argv);
    await cli.parse();
}

/**
 * Content-aware shell completion handler.
 *
 * For flags that accept workspace-derived values (--group, --api, --instance)
 * we spawn the tiny `complete.cjs` helper (~200KB) instead of doing the work
 * inside the full 29MB CLI process. This makes TAB fast because Node.js loads
 * far less code on each key press.
 *
 * Falls back to inline fern.yml parsing when the helper binary is not present
 * (e.g. running from source during development).
 */
function completionHandler(
    _current: string,
    _argv: Record<string, unknown>,
    defaultCompletionsFn: (onCompleted?: (err: Error | null, completions: string[] | undefined) => void) => void,
    done: (completions: string[]) => void
): void {
    const args = process.argv;
    const prev = args[args.length - 2];

    if (prev === "--group" || prev === "--api" || prev === "--instance") {
        const helperPath = resolveCompletionHelperPath();
        if (helperPath != null) {
            const result = spawnSync(process.execPath, [helperPath, prev], {
                cwd: process.cwd(),
                encoding: "utf-8"
            });
            const lines = (result.stdout ?? "")
                .split("\n")
                .map((l) => l.trim())
                .filter((l) => l.length > 0);
            done(lines);
        } else {
            // Fallback: inline parse (used when running from source)
            void import("./completion.js")
                .then(({ getCompletionValues }) => getCompletionValues(process.cwd()))
                .then((values) => {
                    if (prev === "--group") {
                        done(values.groups);
                    } else if (prev === "--api") {
                        done(values.apis);
                    } else {
                        done(values.instances);
                    }
                })
                .catch(() => done([]));
        }
        return;
    }

    defaultCompletionsFn((_err, defaults) => {
        done(defaults ?? []);
    });
}

function createCliV2(argv?: string[]): Argv<GlobalArgs> {
    const terminalWidth = process.stdout.columns ?? 80;
    const cli: Argv<GlobalArgs> = yargs(argv ?? hideBin(process.argv))
        .scriptName("fern")
        .usage("Instant Docs and SDKs for your API.")
        .version(Version)
        .wrap(Math.min(120, terminalWidth))
        .option("log-level", {
            type: "string",
            description: "Set log level",
            choices: ["debug", "info", "warn", "error"] as const,
            default: "info"
        })
        .option("env", {
            type: "string",
            description: "Path to a .env file to load environment variables from"
        })
        .completion("completion", "Generate shell completion script", completionHandler)
        .strict()
        .demandCommand()
        .recommendCommands()
        .fail((msg, err, y) => {
            if (err != null) {
                process.stderr.write(`${err.message}\n`);
                process.exit(1);
            }
            if (msg != null) {
                process.stderr.write(`Error: ${msg}\n\n`);
            }
            y.showHelp();
            process.exit(1);
        });

    addApiCommand(cli);
    addAuthCommand(cli);
    addCacheCommand(cli);
    addCheckCommand(cli);
    addConfigCommand(cli);
    addDocsCommand(cli);
    addInitCommand(cli);
    addOrgCommand(cli);
    addReplayCommand(cli);
    addSdkCommand(cli);
    addTelemetryCommand(cli);

    return cli;
}
