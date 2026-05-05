import { CliError } from "@fern-api/task-context";

import chalk from "chalk";
import type { Argv } from "yargs";
import { FernRcSchemaLoader } from "../../../config/fern-rc/FernRcSchemaLoader.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { command } from "../../_internal/command.js";
import { commandGroup } from "../../_internal/commandGroup.js";

export declare namespace AiSetKeyCommand {
    export interface Args extends GlobalArgs {
        key: string;
    }
}

export class AiSetKeyCommand {
    public async handle(context: Context, args: AiSetKeyCommand.Args): Promise<void> {
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();

        await loader.save({
            ...data,
            ai: {
                ...data.ai,
                anthropic_api_key: args.key
            }
        });

        context.stderr.info(`${chalk.green("✓")} Anthropic API key saved to ${chalk.cyan(loader.absoluteFilePath)}`);
        context.stderr.info(chalk.dim("  Use 'fern config ai get-key' to verify it was stored correctly."));
    }
}

export class AiGetKeyCommand {
    public async handle(context: Context, _args: GlobalArgs): Promise<void> {
        const loader = new FernRcSchemaLoader();
        const { data } = await loader.load();

        const key = data.ai?.anthropic_api_key;
        if (key == null || key === "") {
            throw new CliError({
                message: "No Anthropic API key configured.\n\n" + "  Run 'fern config ai set-key <key>' to store one.",
                code: CliError.Code.ConfigError
            });
        }

        // Mask all but the last 4 characters so the key isn't fully exposed.
        const masked = key.length > 4 ? `${"*".repeat(key.length - 4)}${key.slice(-4)}` : "****";
        context.stdout.info(masked);
    }
}

function addAiSetKeyCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AiSetKeyCommand();
    command(
        cli,
        "set-key <key>",
        "Store an Anthropic API key in ~/.fernrc for AI-powered fixes",
        (context, args) => cmd.handle(context, args as AiSetKeyCommand.Args),
        (yargs) =>
            yargs.positional("key", {
                type: "string",
                description: "Anthropic API key (starts with sk-ant-)",
                demandOption: true
            })
    );
}

function addAiGetKeyCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new AiGetKeyCommand();
    command(cli, "get-key", "Show the stored Anthropic API key (masked)", (context, args) =>
        cmd.handle(context, args as GlobalArgs)
    );
}

export function addAiCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "ai", "Manage AI settings (e.g. API keys for AI-powered fixes)", [
        addAiSetKeyCommand,
        addAiGetKeyCommand
    ]);
}
