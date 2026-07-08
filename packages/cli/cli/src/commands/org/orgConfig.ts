import { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { isVersionAhead } from "@fern-api/semver-utils";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { FDR_ORIGIN, describeFetchError, parseErrorDetail } from "../docs-theme/themeOrigin.js";

interface OrgConfigResponse {
    orgId: string;
    cliVersionMin?: string;
    updatedAt: string;
}

async function getAuthToken(cliContext: CliContext): Promise<FernToken> {
    const token: FernToken | null = await cliContext.runTask(async (context) => {
        return askToLogin(context);
    });

    if (token == null) {
        return cliContext.failAndThrow("Failed to authenticate. Please run 'fern login' first.", undefined, {
            code: CliError.Code.AuthError
        });
    }
    return token;
}

async function resolveOrgId(cliContext: CliContext, orgOverride?: string): Promise<string> {
    if (orgOverride != null) {
        return orgOverride;
    }
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });
    return project.config.organization;
}

export async function getOrgConfig({
    cliContext,
    org,
    json
}: {
    cliContext: CliContext;
    org?: string;
    json?: boolean;
}): Promise<void> {
    const token = await getAuthToken(cliContext);
    const orgId = await resolveOrgId(cliContext, org);

    await cliContext.runTask(async (context) => {
        let res: Response;
        try {
            res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
                headers: { Authorization: `Bearer ${token.value}` }
            });
        } catch (err) {
            context.failAndThrow(`Failed to reach FDR: ${describeFetchError(err)}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to get org config: HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        const data = (await res.json()) as OrgConfigResponse;

        if (json) {
            process.stdout.write(JSON.stringify(data, null, 2) + "\n");
            return;
        }

        if (data.cliVersionMin != null) {
            context.logger.info(`cli-version (min): ${data.cliVersionMin}`);
        } else {
            context.logger.info(`No org-level CLI config set for "${orgId}".`);
        }
    });
}

export async function setOrgCliVersion({
    cliContext,
    version,
    org
}: {
    cliContext: CliContext;
    version: string;
    org?: string;
}): Promise<void> {
    const SEMVER_RE = /^\d+\.\d+\.\d+$/;
    if (!SEMVER_RE.test(version)) {
        cliContext.failAndThrow(`Invalid version "${version}". Expected semver like 5.45.0.`, undefined, {
            code: CliError.Code.ConfigError
        });
        return;
    }

    const token = await getAuthToken(cliContext);
    const orgId = await resolveOrgId(cliContext, org);

    await cliContext.runTask(async (context) => {
        let res: Response;
        try {
            res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ cliVersionMin: version })
            });
        } catch (err) {
            context.failAndThrow(`Failed to reach FDR: ${describeFetchError(err)}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to set org config: HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        context.logger.info(`Set minimum CLI version to ${chalk.green(version)} for org "${orgId}".`);
    });
}

export async function unsetOrgCliVersion({ cliContext, org }: { cliContext: CliContext; org?: string }): Promise<void> {
    const token = await getAuthToken(cliContext);
    const orgId = await resolveOrgId(cliContext, org);

    await cliContext.runTask(async (context) => {
        let res: Response;
        try {
            res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token.value}` }
            });
        } catch (err) {
            context.failAndThrow(`Failed to reach FDR: ${describeFetchError(err)}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        if (!res.ok) {
            const body = await res.text();
            const detail = parseErrorDetail(body) ?? body;
            context.failAndThrow(`Failed to unset org config: HTTP ${res.status} — ${detail}`, undefined, {
                code: CliError.Code.NetworkError
            });
            return;
        }

        context.logger.info(`Removed minimum CLI version for org "${orgId}".`);
    });
}

/**
 * Fetches the org-level minimum CLI version. Returns undefined if no floor
 * is set or the endpoint is unreachable (silently falls back).
 */
export async function fetchOrgCliVersionMin({
    cliContext,
    orgId,
    token
}: {
    cliContext: CliContext;
    orgId: string;
    token: string;
}): Promise<string | undefined> {
    try {
        const res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            cliContext.logger.debug(`Failed to fetch org config: HTTP ${res.status}`);
            return undefined;
        }
        const data = (await res.json()) as OrgConfigResponse;
        return data.cliVersionMin;
    } catch (err) {
        cliContext.logger.debug(`Failed to fetch org config: ${describeFetchError(err)}`);
        return undefined;
    }
}

/**
 * Checks if the current project version is below the org floor and logs a warning.
 * Returns true if below floor.
 */
export function checkVersionAgainstOrgFloor({
    cliContext,
    projectVersion,
    orgFloor,
    orgId
}: {
    cliContext: CliContext;
    projectVersion: string;
    orgFloor: string;
    orgId: string;
}): boolean {
    try {
        if (isVersionAhead(orgFloor, projectVersion)) {
            cliContext.logger.warn(
                `CLI version ${chalk.dim(projectVersion)} is below org "${orgId}" minimum ${chalk.green(orgFloor)}. ` +
                    `Run ${chalk.cyan("fern upgrade")} to update.`
            );
            return true;
        }
    } catch {
        // version comparison failed — don't block
    }
    return false;
}
