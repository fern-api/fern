import { getOrCreateFernRunId } from "@fern-api/cli-telemetry";
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
import { getCompletionValues, isCompletionMode } from "./completion.js";
import { GlobalArgs } from "./context/GlobalArgs.js";
import { Version } from "./version.js";

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
 * When the previous token is a flag that accepts workspace-derived values
 * (e.g. `--group`, `--api`, `--instance`) we do a lightweight fern.yml
 * parse and return matching entries. Otherwise we fall back to default
 * yargs completions (commands, other flags, etc.).
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
        void getCompletionValues(process.cwd())
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
