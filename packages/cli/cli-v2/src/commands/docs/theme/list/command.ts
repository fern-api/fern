import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

// FERN_FDR_ORIGIN is checked first because DEFAULT_FDR_ORIGIN is baked into the
// prod bundle at build time and cannot be overridden at runtime.
const FDR_ORIGIN =
    process.env.FERN_FDR_ORIGIN ?? process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com";

export declare namespace ListThemesCommand {
    export interface Args extends GlobalArgs {
        org?: string;
    }
}

export class ListThemesCommand {
    public async handle(context: Context, args: ListThemesCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();
        const orgId = await this.resolveOrg(context, args);

        const res = await fetch(`${FDR_ORIGIN}/v2/registry/themes/${orgId}`, {
            headers: { Authorization: `Bearer ${token.value}` }
        });
        if (!res.ok) {
            const body = await res.text();
            throw new CliError({
                message: `Failed to list themes: HTTP ${res.status} — ${body}`,
                code: CliError.Code.NetworkError
            });
        }

        const data = (await res.json()) as { themes: Array<{ name: string; updatedAt: string }> };
        if (data.themes.length === 0) {
            context.stdout.info(`No themes found for org "${orgId}".`);
            return;
        }
        for (const theme of data.themes) {
            context.stdout.info(`  ${theme.name}  (updated ${new Date(theme.updatedAt).toLocaleString()})`);
        }
    }

    private async resolveOrg(context: Context, args: ListThemesCommand.Args): Promise<string> {
        if (args.org != null) {
            return args.org;
        }
        const org = await context.loadOrg();
        if (org != null) {
            return org;
        }
        throw new CliError({
            message: "Could not determine organization. Add an 'org' field to fern.yml or run from a Fern workspace.",
            code: CliError.Code.ConfigError
        });
    }
}

export function addListThemesCommand(cli: Argv<GlobalArgs>): void {
    const cmd = new ListThemesCommand();
    command(
        cli,
        "list",
        "List all themes for an org",
        (context, args) => cmd.handle(context, args as ListThemesCommand.Args),
        (yargs) =>
            yargs
                .option("org", {
                    type: "string",
                    description: "Override the org ID from fern.yml"
                })
                .example("$0 docs theme list", "List all themes for the current org")
    );
}
