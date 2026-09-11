import { AbsoluteFilePath, dirname } from "@fern-api/fs-utils";
import { runLibraryDocsGeneration } from "@fern-api/library-docs-generator";
import { LogLevel } from "@fern-api/logger";
import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import { TaskContextAdapter } from "../../../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { withSpinner } from "../../../../ui/withSpinner.js";
import { command } from "../../../_internal/command.js";

export declare namespace GenerateCommand {
    export interface Args extends GlobalArgs {
        /** If specified, only generate docs for this library. */
        library?: string;
        /** Escape hatch: generate on Fern's servers instead of running the parser Docker images locally. */
        remote?: boolean;
    }
}

export class GenerateCommand {
    public async handle(context: Context, args: GenerateCommand.Args): Promise<void> {
        const workspace = await context.loadWorkspaceOrThrow();

        if (workspace.docs == null) {
            throw new CliError({
                message:
                    "No docs configuration found in fern.yml.\n\n" +
                    "  Add a 'docs:' section to your fern.yml to get started.",
                code: CliError.Code.ConfigError
            });
        }

        const libraries = workspace.docs.raw.libraries;
        if (libraries == null) {
            throw new CliError({
                message:
                    "No libraries configured in docs.yml.\n\n" +
                    "  Add a 'libraries' section to configure library documentation.",
                code: CliError.Code.ConfigError
            });
        }

        let tokenValue: string | undefined;
        if (args.remote === true) {
            const token = await context.getTokenOrPrompt();
            await context.verifyOrgAccess({ organization: workspace.org, token });
            tokenValue = token.value;
        }

        const docsFilePath = workspace.docs.absoluteFilePath ?? workspace.absoluteFilePath ?? context.cwd;
        const docsDirectoryPath = AbsoluteFilePath.of(dirname(docsFilePath));

        const taskContext = new TaskContextAdapter({ context, logLevel: LogLevel.Info });
        // Orchestrator throws if any library fails, so a non-throwing return
        // means everything succeeded.
        await runLibraryDocsGeneration({
            libraries,
            library: args.library,
            docsDirectoryPath,
            context: taskContext,
            wrapStep: withSpinner,
            remote: args.remote === true,
            orgId: args.remote === true ? workspace.org : undefined,
            tokenValue
        });
    }
}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new GenerateCommand();
    command(
        cli,
        "generate",
        "[Beta] Generate MDX documentation from library source code. Requires 'libraries' config in docs.yml.",
        (context, args) => cmd.handle(context, args as GenerateCommand.Args),
        (yargs) =>
            yargs
                .option("library", {
                    type: "string",
                    description: "Name of a specific library defined in docs.yml to generate docs for"
                })
                .option("remote", {
                    type: "boolean",
                    default: false,
                    description:
                        "Generate on Fern's servers instead of running the parser Docker images locally. Requires authentication. Use when Docker is unavailable (e.g. containerized CI)."
                })
    );
}
