import type { Argv } from "yargs";
import { GENERATE_COMMAND_TIMEOUT_MS } from "../../../constants.js";
import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { command } from "../../_internal/command.js";
import { GenerateCommand } from "../generate/command.js";

export declare namespace PreviewCommand {
    export type Args = Omit<GenerateCommand.Args, "preview">;
}

export class PreviewCommand {
    private readonly generateCommand = new GenerateCommand();

    public async handle(context: Context, args: PreviewCommand.Args): Promise<void> {
        await this.generateCommand.handle(context, {
            ...args,
            preview: true
        });
    }
}

export function addPreviewCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new PreviewCommand();
    command(
        cli,
        "preview",
        "Generate a preview of an SDK",
        async (context, args) => {
            const timeout = new Promise<never>((_, reject) => {
                setTimeout(
                    () => reject(new CliError({ message: "Preview generation timed out after 10 minutes." })),
                    GENERATE_COMMAND_TIMEOUT_MS
                ).unref();
            });
            await Promise.race([cmd.handle(context, args as PreviewCommand.Args), timeout]);
        },
        (yargs) =>
            yargs
                .option("api", {
                    type: "string",
                    description: "Path or URL to an API spec file (enables no-config mode)"
                })
                .option("audience", {
                    type: "array",
                    string: true,
                    description: "Filter the target API(s) with the given audience(s)"
                })
                .option("container-engine", {
                    choices: ["docker", "podman"],
                    description: "Choose the container engine to use for local generation"
                })
                .option("force", {
                    type: "boolean",
                    default: false,
                    description: "Ignore prompts to confirm generation"
                })
                .option("group", {
                    type: "string",
                    description: "The SDK group to generate"
                })
                .option("keep-container", {
                    type: "boolean",
                    default: false,
                    description: "Prevent auto-deletion of any containers used for local generation"
                })
                .option("local", {
                    type: "boolean",
                    default: false,
                    description: "Run the generator locally in a container"
                })
                .option("org", {
                    type: "string",
                    description: "Organization name (required with --api)"
                })

                .option("output", {
                    type: "string",
                    description: "Output path or git URL (required with --api)"
                })

                .option("output-version", {
                    type: "string",
                    description: "The version to use for the generated packages (e.g. 1.0.0)"
                })
                .option("target", {
                    type: "string",
                    description: "The SDK target to generate"
                })
                .option("target-version", {
                    type: "string",
                    description: "The generator version for the target"
                })
                .option("fernignore", {
                    type: "string",
                    description: "Path to .fernignore file",
                    hidden: true
                })
    );
}
