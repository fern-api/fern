import { FernToken } from "@fern-api/auth";
import { errorMessageOrString } from "@fern-api/core-utils";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

interface StaleThemeSite {
    domain: string;
    basepath: string;
    globalTheme: string;
}

export async function rebuildDocsThemeSites({
    cliContext,
    name,
    org,
    dryRun
}: {
    cliContext: CliContext;
    name?: string;
    org?: string;
    dryRun: boolean;
}): Promise<void> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
        return;
    }

    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    const orgId = org ?? project.config.organization;
    const scope = name != null ? `theme "${name}"` : "all themes";

    await cliContext.runTask(async (context) => {
        let res: Response;
        try {
            res = await fetch(`${FDR_ORIGIN}/docs-ledger/global-theme/rebuild-stale`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token.value}` },
                body: JSON.stringify({ dryRun, orgId, ...(name != null && { theme: name }) })
            });
        } catch (err) {
            context.failAndThrow(
                `Failed to rebuild theme sites — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
            return;
        }

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to rebuild theme sites: HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        let sites: StaleThemeSite[];
        try {
            const parsed = (await res.json()) as { sites?: unknown };
            if (!Array.isArray(parsed.sites)) {
                throw new Error("response has no `sites` list");
            }
            sites = parsed.sites as StaleThemeSite[];
        } catch (err) {
            context.failAndThrow(
                `Failed to rebuild theme sites: unexpected response from ${FDR_ORIGIN}: ${errorMessageOrString(err)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
            return;
        }
        if (sites.length === 0) {
            context.logger.info(
                `Every site using ${scope} in org "${orgId}" is already built with its latest version.`
            );
            return;
        }

        for (const site of sites) {
            context.logger.info(`  ${site.domain}${site.basepath} (theme "${site.globalTheme}")`);
        }
        context.logger.info(
            dryRun
                ? `${sites.length} site(s) use an older version of ${scope}. Run without --dry-run to rebuild them.`
                : `Queued rebuilds for ${sites.length} site(s) using ${scope}. They pick up the latest theme once their builds finish.`
        );
    });
}
