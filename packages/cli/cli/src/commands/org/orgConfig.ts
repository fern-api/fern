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
    cliVersionMax?: string;
    updatedAt: string;
}

export interface OrgCliVersionBounds {
    min?: string;
    max?: string;
}

const SEMVER_RE = /^\d+\.\d+\.\d+$/;

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

        if (data.cliVersionMin == null && data.cliVersionMax == null) {
            context.logger.info(`No org-level CLI config set for "${orgId}".`);
            return;
        }
        if (data.cliVersionMin != null && data.cliVersionMin === data.cliVersionMax) {
            context.logger.info(`cli-version (pinned): ${data.cliVersionMin}`);
            return;
        }
        if (data.cliVersionMin != null) {
            context.logger.info(`cli-version-min: ${data.cliVersionMin}`);
        }
        if (data.cliVersionMax != null) {
            context.logger.info(`cli-version-max: ${data.cliVersionMax}`);
        }
    });
}

/**
 * Sets the org-level CLI version bounds. Pass `min` and/or `max`; passing both
 * with the same value pins to an exact version. Only the supplied bounds are
 * updated (the other is left untouched server-side).
 */
export async function setOrgCliVersion({
    cliContext,
    min,
    max,
    org
}: {
    cliContext: CliContext;
    min?: string;
    max?: string;
    org?: string;
}): Promise<void> {
    for (const version of [min, max]) {
        if (version != null && !SEMVER_RE.test(version)) {
            cliContext.failAndThrow(`Invalid version "${version}". Expected semver like 5.45.0.`, undefined, {
                code: CliError.Code.ConfigError
            });
            return;
        }
    }
    if (min != null && max != null && isVersionAhead(min, max)) {
        cliContext.failAndThrow(`Minimum version ${min} must not be greater than maximum version ${max}.`, undefined, {
            code: CliError.Code.ConfigError
        });
        return;
    }

    const token = await getAuthToken(cliContext);
    const orgId = await resolveOrgId(cliContext, org);

    const requestBody: { cliVersionMin?: string; cliVersionMax?: string } = {};
    if (min != null) {
        requestBody.cliVersionMin = min;
    }
    if (max != null) {
        requestBody.cliVersionMax = max;
    }

    await cliContext.runTask(async (context) => {
        let res: Response;
        try {
            res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
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

        if (min != null && max != null && min === max) {
            context.logger.info(`Pinned CLI version to ${chalk.green(min)} for org "${orgId}".`);
        } else if (min != null) {
            context.logger.info(`Set minimum CLI version to ${chalk.green(min)} for org "${orgId}".`);
        } else if (max != null) {
            context.logger.info(`Set maximum CLI version to ${chalk.green(max)} for org "${orgId}".`);
        }
    });
}

/**
 * Clears an org-level CLI version bound. `field` selects which bound to remove:
 * `min`/`max` clear a single bound (PUT with null); `all` removes the whole
 * config (DELETE).
 */
export async function unsetOrgCliVersion({
    cliContext,
    org,
    field
}: {
    cliContext: CliContext;
    org?: string;
    field: "min" | "max" | "all";
}): Promise<void> {
    const token = await getAuthToken(cliContext);
    const orgId = await resolveOrgId(cliContext, org);

    await cliContext.runTask(async (context) => {
        let res: Response;
        try {
            if (field === "all") {
                res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token.value}` }
                });
            } else {
                const requestBody = field === "min" ? { cliVersionMin: null } : { cliVersionMax: null };
                res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token.value}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(requestBody)
                });
            }
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

        const label = field === "min" ? "minimum" : field === "max" ? "maximum" : "minimum and maximum";
        context.logger.info(`Removed ${label} CLI version for org "${orgId}".`);
    });
}

/**
 * Fetches the org-level CLI version bounds (min/max). Returns empty bounds if
 * none are set or the endpoint is unreachable (silently falls back).
 */
export async function fetchOrgCliVersionBounds({
    cliContext,
    orgId,
    token,
    timeoutMs
}: {
    cliContext: CliContext;
    orgId: string;
    token: string;
    timeoutMs?: number;
}): Promise<OrgCliVersionBounds> {
    try {
        const res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: timeoutMs != null ? AbortSignal.timeout(timeoutMs) : undefined
        });
        if (!res.ok) {
            cliContext.logger.debug(`Failed to fetch org config: HTTP ${res.status}`);
            return {};
        }
        const data = (await res.json()) as OrgConfigResponse;
        return { min: data.cliVersionMin, max: data.cliVersionMax };
    } catch (err) {
        cliContext.logger.debug(`Failed to fetch org config: ${describeFetchError(err)}`);
        return {};
    }
}

const ORG_FLOOR_FETCH_TIMEOUT_MS = 2500;
const ORG_FLOOR_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const ORG_FLOOR_CACHE_FILENAME = "org-cli-floor-cache.json";

interface OrgFloorCacheEntry {
    cliVersionMin: string | null;
    cliVersionMax: string | null;
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

async function writeOrgFloorCache(orgId: string, bounds: OrgCliVersionBounds): Promise<void> {
    try {
        const cachePath = getOrgFloorCachePath();
        let existing: Record<string, OrgFloorCacheEntry> = {};
        try {
            existing = JSON.parse(await readFile(cachePath, "utf-8")) as Record<string, OrgFloorCacheEntry>;
        } catch {
            // no existing cache
        }
        existing[orgId] = {
            cliVersionMin: bounds.min ?? null,
            cliVersionMax: bounds.max ?? null,
            fetchedAt: Date.now()
        };
        await mkdir(path.dirname(cachePath), { recursive: true });
        await writeFile(cachePath, JSON.stringify(existing), "utf-8");
    } catch {
        // caching is best-effort; ignore write failures
    }
}

/**
 * Resolves the org-level CLI version bounds for use in the version-redirection
 * path. Reads a disk cache first (short TTL) and only hits FDR on a cache miss,
 * using a tight timeout. Fails open (returns empty bounds) on any error —
 * missing auth, network failure, timeout — so the floor never blocks a command.
 */
async function getCachedOrgCliVersionBounds({
    cliContext,
    orgId
}: {
    cliContext: CliContext;
    orgId: string;
}): Promise<OrgCliVersionBounds> {
    if (process.env.FERN_IGNORE_ORG_VERSION_FLOOR === "true") {
        return {};
    }

    const cached = await readOrgFloorCache(orgId);
    if (cached != null) {
        return { min: cached.cliVersionMin ?? undefined, max: cached.cliVersionMax ?? undefined };
    }

    try {
        const { getToken } = await import("@fern-api/auth");
        const token = await getToken();
        if (token == null) {
            return {};
        }
        const bounds = await fetchOrgCliVersionBounds({
            cliContext,
            orgId,
            token: token.value,
            timeoutMs: ORG_FLOOR_FETCH_TIMEOUT_MS
        });
        await writeOrgFloorCache(orgId, bounds);
        return bounds;
    } catch (err) {
        cliContext.logger.debug(`Failed to resolve org CLI version bounds: ${String(err)}`);
        return {};
    }
}

/**
 * Clamps the version the CLI would otherwise run into the org-level bounds:
 * bumps up to `min` (floor) and down to `max` (ceiling). Used by the
 * version-redirection layer so every command runs within the org's allowed
 * range. Fails open to `intendedVersion`.
 */
export async function applyOrgBoundsToVersion({
    cliContext,
    orgId,
    intendedVersion
}: {
    cliContext: CliContext;
    orgId: string;
    intendedVersion: string;
}): Promise<string> {
    const { min, max } = await getCachedOrgCliVersionBounds({ cliContext, orgId });
    try {
        if (min != null && isVersionAhead(min, intendedVersion)) {
            cliContext.logger.info(
                `Org "${orgId}" requires Fern CLI ${chalk.green(`>= ${min}`)} — running ${chalk.green(min)}.`
            );
            return min;
        }
        if (max != null && isVersionAhead(intendedVersion, max)) {
            cliContext.logger.info(
                `Org "${orgId}" caps Fern CLI at ${chalk.green(`<= ${max}`)} — running ${chalk.green(max)}.`
            );
            return max;
        }
    } catch {
        // version comparison failed — don't block
    }
    return intendedVersion;
}
