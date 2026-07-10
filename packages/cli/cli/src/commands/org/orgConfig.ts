import { FernToken } from "@fern-api/auth";
import { askToLogin } from "@fern-api/login";
import { isVersionAhead } from "@fern-api/semver-utils";
import { CliError } from "@fern-api/task-context";
import chalk from "chalk";
import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import path from "path";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { describeFetchError, FDR_ORIGIN, parseErrorDetail } from "../docs-theme/themeOrigin.js";

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
    token,
    timeoutMs
}: {
    cliContext: CliContext;
    orgId: string;
    token: string;
    timeoutMs?: number;
}): Promise<string | undefined> {
    try {
        const res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: timeoutMs != null ? AbortSignal.timeout(timeoutMs) : undefined
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

const ORG_FLOOR_FETCH_TIMEOUT_MS = 2500;
const ORG_FLOOR_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const ORG_FLOOR_CACHE_FILENAME = "org-cli-floor-cache.json";

interface OrgFloorCacheEntry {
    cliVersionMin: string | null;
    fetchedAt: number;
}

function getOrgFloorCachePath(): string {
    const storageFolder = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";
    return path.join(homedir(), storageFolder, ORG_FLOOR_CACHE_FILENAME);
}

async function readOrgFloorCache(orgId: string): Promise<OrgFloorCacheEntry | undefined> {
    try {
        const raw = await readFile(getOrgFloorCachePath(), "utf-8");
        const parsed = JSON.parse(raw) as Record<string, OrgFloorCacheEntry>;
        const entry = parsed[orgId];
        if (entry == null || Date.now() - entry.fetchedAt > ORG_FLOOR_CACHE_TTL_MS) {
            return undefined;
        }
        return entry;
    } catch {
        return undefined;
    }
}

async function writeOrgFloorCache(orgId: string, cliVersionMin: string | undefined): Promise<void> {
    try {
        const cachePath = getOrgFloorCachePath();
        let existing: Record<string, OrgFloorCacheEntry> = {};
        try {
            existing = JSON.parse(await readFile(cachePath, "utf-8")) as Record<string, OrgFloorCacheEntry>;
        } catch {
            // no existing cache
        }
        existing[orgId] = { cliVersionMin: cliVersionMin ?? null, fetchedAt: Date.now() };
        await mkdir(path.dirname(cachePath), { recursive: true });
        await writeFile(cachePath, JSON.stringify(existing), "utf-8");
    } catch {
        // caching is best-effort; ignore write failures
    }
}

/**
 * Resolves the org-level minimum CLI version for use in the version-redirection
 * path. Reads a disk cache first (short TTL) and only hits FDR on a cache miss,
 * using a tight timeout. Fails open (returns undefined) on any error — missing
 * auth, network failure, timeout — so the floor never blocks a command.
 */
async function getCachedOrgCliVersionMin({
    cliContext,
    orgId
}: {
    cliContext: CliContext;
    orgId: string;
}): Promise<string | undefined> {
    if (process.env.FERN_IGNORE_ORG_VERSION_FLOOR === "true") {
        return undefined;
    }

    const cached = await readOrgFloorCache(orgId);
    if (cached != null) {
        return cached.cliVersionMin ?? undefined;
    }

    try {
        const { getToken } = await import("@fern-api/auth");
        const token = await getToken();
        if (token == null) {
            return undefined;
        }
        const cliVersionMin = await fetchOrgCliVersionMin({
            cliContext,
            orgId,
            token: token.value,
            timeoutMs: ORG_FLOOR_FETCH_TIMEOUT_MS
        });
        await writeOrgFloorCache(orgId, cliVersionMin);
        return cliVersionMin;
    } catch (err) {
        cliContext.logger.debug(`Failed to resolve org CLI version floor: ${String(err)}`);
        return undefined;
    }
}

/**
 * Given the version the CLI would otherwise run, returns the org floor when it
 * is higher. Used by the version-redirection layer so every command runs at
 * >= the org minimum. Fails open to `intendedVersion`.
 */
export async function applyOrgFloorToVersion({
    cliContext,
    orgId,
    intendedVersion
}: {
    cliContext: CliContext;
    orgId: string;
    intendedVersion: string;
}): Promise<string> {
    const floor = await getCachedOrgCliVersionMin({ cliContext, orgId });
    if (floor == null) {
        return intendedVersion;
    }
    try {
        if (isVersionAhead(floor, intendedVersion)) {
            cliContext.logger.info(
                `Org "${orgId}" requires Fern CLI ${chalk.green(`>= ${floor}`)} — running ${chalk.green(floor)}.`
            );
            return floor;
        }
    } catch {
        // version comparison failed — don't block
    }
    return intendedVersion;
}

