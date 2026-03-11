import { createVenusService } from "@fern-api/core";
import type { FernVenusApiClient } from "@fern-api/venus-api-sdk";
import { spawn } from "child_process";
import type { Argv } from "yargs";

import type { Context } from "../../../context/Context.js";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { CliError } from "../../../errors/CliError.js";
import { Icons } from "../../../ui/format.js";
import { command } from "../../_internal/command.js";

export declare namespace ListCommand {
    export interface Args extends GlobalArgs {}
}

export class ListCommand {
    public async handle(context: Context): Promise<void> {
        const token = await context.getTokenOrPrompt();

        if (token.type === "organization") {
            context.stderr.error(
                `${Icons.error} Organization tokens cannot list organizations. Unset the FERN_TOKEN environment variable and run 'fern auth login' to list your organizations.`
            );
            throw CliError.exit();
        }

        const venus = createVenusService({ token: token.value });

        // Fetch the first page to check if there are any results.
        const firstPage = await this.fetchPage({ venus, pageId: 1 });
        if (firstPage.organizations.length === 0) {
            context.stderr.info(`${Icons.info} You are not a member of any organizations.`);
            context.stderr.info("");
            context.stderr.info("  To create one, run: fern org create <name>");
            return;
        }

        if (context.isTTY) {
            await this.displayWithPager({ context, venus, firstPage });
            return;
        }
        await this.displayAll({ context, venus, firstPage });
    }

    /**
     * Write all organizations directly to a writable stream.
     */
    private async displayAll({
        context,
        venus,
        firstPage
    }: {
        context: Context;
        venus: FernVenusApiClient;
        firstPage: { organizations: string[]; nextPage?: number };
    }): Promise<void> {
        let page = firstPage;
        while (true) {
            for (const org of page.organizations) {
                context.stdout.info(org);
            }
            if (page.nextPage == null) {
                break;
            }
            page = await this.fetchPage({ venus, pageId: page.nextPage });
        }
    }

    /**
     * Pipe output through the system pager (e.g. less) for interactive terminals.
     * Fetches additional pages lazily as the pager consumes output.
     */
    private async displayWithPager({
        context,
        venus,
        firstPage
    }: {
        context: Context;
        venus: FernVenusApiClient;
        firstPage: { organizations: string[]; nextPage?: number };
    }): Promise<void> {
        const pager = this.getPager();
        const pagerStdin = pager.stdin;
        if (pagerStdin == null) {
            await this.displayAll({ context, venus, firstPage });
            return;
        }

        // Also handle spawn errors asynchronously (e.g. command not found on PATH).
        const spawnError = await new Promise<Error | null>((resolve) => {
            pager.on("error", (error) => resolve(error));
            pagerStdin.on("ready", () => resolve(null));
            setTimeout(() => resolve(null), 50);
        });

        if (spawnError != null) {
            await this.displayAll({ context, venus, firstPage });
            return;
        }

        const write = (text: string): boolean => {
            if (pagerStdin.destroyed) {
                return false;
            }
            return pagerStdin.write(text);
        };

        try {
            let page = firstPage;
            while (true) {
                for (const org of page.organizations) {
                    if (!write(`${org}\n`)) {
                        return;
                    }
                }
                if (page.nextPage == null) {
                    break;
                }
                page = await this.fetchPage({ venus, pageId: page.nextPage });
            }
        } finally {
            if (!pagerStdin.destroyed) {
                pagerStdin.end();
            }
            await new Promise<void>((resolve) => {
                pager.on("close", resolve);
            });
        }
    }

    private async fetchPage({
        venus,
        pageId
    }: {
        venus: FernVenusApiClient;
        pageId: number;
    }): Promise<{ organizations: string[]; nextPage?: number }> {
        const response = await venus.user.getMyOrganizations({ pageId });
        if (!response.ok) {
            throw CliError.internalError("Failed to fetch organizations.");
        }
        return {
            organizations: response.body.organizations.map(String),
            nextPage: response.body.nextPage ?? undefined
        };
    }

    private getPager(): ReturnType<typeof spawn> {
        const defaultPager = process.platform === "win32" ? "more" : "less";
        const pagerCmd = process.env.PAGER ?? defaultPager;
        return spawn(pagerCmd, {
            stdio: ["pipe", "inherit", "inherit"],
            env: {
                ...process.env,
                // -F: quit if output fits on one screen
                // -R: interpret ANSI color codes
                // -X: don't use alternate screen (stay inline)
                LESS: process.env.LESS ?? "-FRX"
            }
        });
    }
}

export function addListCommand(cli: Argv<GlobalArgs>, parentPath?: string): void {
    const cmd = new ListCommand();
    command(cli, "list", "List your organizations", (context) => cmd.handle(context), undefined, parentPath);
}
