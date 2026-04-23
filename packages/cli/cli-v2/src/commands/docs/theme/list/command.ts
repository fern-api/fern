import type { FernToken } from "@fern-api/auth";
import { createVenusService } from "@fern-api/core";
import { CliError } from "@fern-api/task-context";

import type { Argv } from "yargs";
import type { Context } from "../../../../context/Context.js";
import type { GlobalArgs } from "../../../../context/GlobalArgs.js";
import { command } from "../../../_internal/command.js";

const FDR_ORIGIN = "http://localhost:8080";
const VENUS_ORIGIN = "http://localhost:8089";

export declare namespace ListThemesCommand {
    export interface Args extends GlobalArgs {
        org?: string;
    }
}

export class ListThemesCommand {
    public async handle(context: Context, args: ListThemesCommand.Args): Promise<void> {
        const token = await context.getTokenOrPrompt();
        const orgId = await this.resolveOrg(context, args, token);

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

    private async resolveOrg(context: Context, args: ListThemesCommand.Args, token: FernToken): Promise<string> {
        if (args.org != null) {
            return args.org;
        }

        const workspace = await context.loadWorkspace();
        if (workspace != null && workspace.success) {
            return workspace.workspace.org;
        }

        return this.resolveOrgFromToken(token);
    }

    private async resolveOrgFromToken(token: FernToken): Promise<string> {
        process.stderr.write(`[debug] token type: ${token.type}\n`);
        process.stderr.write(`[debug] token prefix: ${token.value.slice(0, 30)}...\n`);
        const venus = createVenusService({ token: token.value, environment: VENUS_ORIGIN });

        if (token.type === "organization") {
            const response = await venus.organization.getMyOrganizationFromScopedToken();
            process.stderr.write(`[debug] getMyOrganizationFromScopedToken ok=${String(response.ok)}\n`);
            if (response.ok) {
                return response.body.organizationId;
            }
            // Org-scoped call failed (e.g. local dev token against prod Venus).
            // Fall through to the user-token path as a best-effort fallback.
        }

        const response = await venus.user.getMyOrganizations({ pageId: 1 });
        process.stderr.write(
            `[debug] getMyOrganizations ok=${String(response.ok)} url=${JSON.stringify((response as unknown as { rawResponse?: { url?: string } }).rawResponse?.url)}\n`
        );
        if (!response.ok) {
            process.stderr.write(`[debug] getMyOrganizations error: ${JSON.stringify(response.error)}\n`);
            throw new CliError({
                message: "Failed to fetch your organizations. Use --org <id> to specify it explicitly.",
                code: CliError.Code.AuthError
            });
        }

        const orgs = response.body.organizations;
        if (orgs.length === 0) {
            throw new CliError({
                message: "You are not a member of any organizations. Use --org <id> to specify one.",
                code: CliError.Code.ConfigError
            });
        }
        if (orgs.length > 1) {
            throw new CliError({
                message: `You belong to multiple organizations (${orgs.join(", ")}). Use --org <id> to specify which one to use.`,
                code: CliError.Code.ConfigError
            });
        }

        return String(orgs[0]);
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
                    description: "Override the org ID from fern.config.json"
                })
                .example("$0 docs theme list", "List all themes for the current org")
    );
}
