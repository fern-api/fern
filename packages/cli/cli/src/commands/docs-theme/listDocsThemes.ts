import { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

interface ThemeEntry {
    name: string;
    updatedAt: string;
}

export async function listDocsThemes({
    cliContext,
    org,
    json
}: {
    cliContext: CliContext;
    org?: string;
    json?: boolean;
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

    await cliContext.runTask(async (context) => {
        const res = await fetch(`${FDR_ORIGIN}/v2/registry/themes/${orgId}`, {
            headers: { Authorization: `Bearer ${token.value}` }
        });

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to list themes: HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        const data = (await res.json()) as { themes: ThemeEntry[] };

        if (data.themes.length === 0) {
            context.logger.info(`No themes found for org "${orgId}".`);
            return;
        }

        if (json) {
            process.stdout.write(JSON.stringify(data.themes, null, 2) + "\n");
            return;
        }

        for (const theme of data.themes) {
            process.stdout.write(theme.name + "\n");
        }
    });
}
