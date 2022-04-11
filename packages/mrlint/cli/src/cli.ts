import { LogLevel } from "@mrlint/commons";
import yargs from "yargs";
import { lintCommand } from "./commands/lintCommand";
import { ConsoleMonorepoLogger } from "./ConsoleMonorepoLogger";

type CommandLineLogLevel = "debug" | "info" | "warn" | "error";
const DEFAULT_COMMAND_LINE_LOG_LEVEL: CommandLineLogLevel = "info";

const LOG_LEVELS: Record<CommandLineLogLevel, true> = {
    debug: true,
    info: true,
    warn: true,
    error: true,
};

export function runCli(): void {
    yargs
        .strict()
        .option("--log-level", {
            default: DEFAULT_COMMAND_LINE_LOG_LEVEL,
            choices: keys(LOG_LEVELS),
        })
        .command(
            "lint",
            "Lint the monorepo",
            (argv) =>
                argv.option("--fix", {
                    boolean: true,
                    default: false,
                }),
            async (argv) => {
                await lintCommand({
                    loggers: new ConsoleMonorepoLogger(convertLogLevel(argv["--log-level"])),
                    shouldFix: argv["--fix"],
                });
            }
        )
        .demandCommand()
        .showHelpOnFail(true)
        .parse();
}

function convertLogLevel(level: CommandLineLogLevel): LogLevel {
    switch (level) {
        case "debug":
            return LogLevel.DEBUG;
        case "info":
            return LogLevel.INFO;
        case "warn":
            return LogLevel.WARN;
        case "error":
            return LogLevel.ERROR;
    }
}

function keys<T>(obj: T): (keyof T & string)[] {
    return Object.keys(obj) as (keyof T & string)[];
}
