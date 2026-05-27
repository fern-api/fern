import { createInterface } from "node:readline";
import { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { CliError } from "@fern-api/task-context";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "./themeOrigin.js";

async function confirmDeletion(themeName: string): Promise<boolean> {
    const rl = createInterface({ input: process.stdin, output: process.stderr });
    return new Promise((resolve) => {
        rl.question(`Are you sure you want to delete the theme "${themeName}"? (y/N) `, (answer) => {
            rl.close();
            resolve(answer.trim().toLowerCase() === "y");
        });
    });
}

export async function deleteDocsTheme({
    cliContext,
    name,
    org,
    yes
}: {
    cliContext: CliContext;
    name: string;
    org?: string;
    yes?: boolean;
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

    if (!yes) {
        const confirmed = await confirmDeletion(name);
        if (!confirmed) {
            cliContext.logger.info("Deletion cancelled.");
            return;
        }
    }

    await cliContext.runTask(async (context) => {
        const deleteUrl = `${FDR_ORIGIN}/v2/registry/themes/${orgId}/${encodeURIComponent(name)}`;
        context.logger.debug(`Deleting theme at ${deleteUrl}`);

        let res: Response;
        try {
            res = await fetch(deleteUrl, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token.value}` }
            });
        } catch (err) {
            context.failAndThrow(
                `Failed to delete theme "${name}" — could not reach ${FDR_ORIGIN}: ${describeFetchError(err)}`,
                undefined,
                { code: CliError.Code.NetworkError }
            );
            return;
        }

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to delete theme "${name}": HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        context.logger.info(`Theme "${name}" deleted for org "${orgId}"`);
    });
}
