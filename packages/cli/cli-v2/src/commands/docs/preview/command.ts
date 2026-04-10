import type { Argv } from "yargs";
import { GENERATE_COMMAND_TIMEOUT_MS } from "../../../constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { commandWithSubcommands } from "../../_internal/commandWithSubcommands.js";
import { PublishCommand } from "../publish/command.js";
import { addDeleteCommand } from "./delete/index.js";

export declare namespace PreviewCommand {
    export interface Args extends GlobalArgs {
        instance?: string;
        id?: string;
        strict: boolean;
        "skip-upload": boolean;
    }
}

export class PreviewCommand {
    private readonly publishCommand = new PublishCommand();

    public async handle(context: Context, args: PreviewCommand.Args): Promise<void> {
        await this.publishCommand.handle(context, {
            ...args,
            preview: true,
            previewId: args.id,
            force: true
        });
    }
}

export function addPreviewCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new PreviewCommand();
    commandWithSubcommands(
        cli,
        "preview",
        "Generate a preview of your documentation site",
        async (context, args) => {
            const timeout = new Promise<never>((_, reject) => {
                setTimeout(
                    () => reject(new CliError({ message: "Docs preview timed out after 10 minutes." })),
                    GENERATE_COMMAND_TIMEOUT_MS
                ).unref();
            });
            await Promise.race([cmd.handle(context, args as PreviewCommand.Args), timeout]);
        },
        (yargs) =>
            yargs
                .option("instance", {
                    type: "string",
                    description: "Select which docs instance to preview"
                })
                .option("strict", {
                    type: "boolean",
                    default: false,
                    description: "Treat all validation warnings as errors"
                })
                .option("id", {
                    type: "string",
                    description:
                        "A stable identifier for the preview. Reusing the same ID overwrites the previous preview, keeping the URL stable."
                })
                .option("skip-upload", {
                    type: "boolean",
                    default: false,
                    description: "Skip uploading assets during preview generation"
                }),
        [addDeleteCommand]
    );
}
