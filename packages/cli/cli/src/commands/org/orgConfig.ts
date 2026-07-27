import { FernToken, getToken } from "@fern-api/auth";
import { FERN_DIRECTORY, getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { askToLogin } from "@fern-api/login";
import { isValidVersion, isVersionAhead } from "@fern-api/semver-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import latestVersion, { VersionNotFoundError } from "latest-version";
import { CliContext } from "../../cli-context/CliContext.js";
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

export type ClampReason = "floor" | "ceiling" | "pin";

/**
 * Pure decision used by the version-redirection layer: given the version the
 * CLI would otherwise run and the org's bounds, return the version to actually
 * run and why it changed (if it did). Bumps up to `min` (floor) and down to
 * `max` (ceiling); returns the intended version unchanged when it's already in
 * range. No I/O, so it's unit-testable in isolation. Assumes the caller has
 * validated the bounds are ordered (`min <= max`).
 */
export function clampVersionToOrgBounds(
    intendedVersion: string,
    { min, max }: OrgCliVersionBounds
): { version: string; reason?: ClampReason } {
    // An exact pin (min === max) reports a single "pin" reason regardless of
    // which side the intended version fell on, so callers can show "pins to X"
    // rather than a confusing ">= X" / "<= X".
    const isPinned = min != null && max != null && min === max;
    if (min != null && isVersionAhead(min, intendedVersion)) {
        return { version: min, reason: isPinned ? "pin" : "floor" };
    }
    if (max != null && isVersionAhead(intendedVersion, max)) {
        return { version: max, reason: isPinned ? "pin" : "ceiling" };
    }
    return { version: intendedVersion };
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
    const fernDirectory = await getFernDirectory();
    if (fernDirectory == null) {
        return cliContext.failAndThrow(
            `Directory "${FERN_DIRECTORY}" not found. Run from a Fern project or pass --org.`,
            undefined,
            { code: CliError.Code.ConfigError }
        );
    }
    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );
    return projectConfig.organization;
}

/**
 * Issues a request to the org-config endpoint and returns the response, failing
 * the task with a clear message on a network error or non-2xx status. Shared by
 * the `get`/`set`/`unset` commands so the fetch + error handling lives in one
 * place. `actionLabel` is interpolated into the error (e.g. "get org config").
 */
async function orgConfigRequest(
    context: TaskContext,
    orgId: string,
    init: RequestInit,
    actionLabel: string
): Promise<Response> {
    let res: Response;
    try {
        res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, init);
    } catch (err) {
        return context.failAndThrow(`Failed to reach FDR: ${describeFetchError(err)}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }
    if (!res.ok) {
        const body = await res.text();
        const detail = parseErrorDetail(body) ?? body;
        return context.failAndThrow(`Failed to ${actionLabel}: HTTP ${res.status} — ${detail}`, undefined, {
            code: CliError.Code.NetworkError
        });
    }
    return res;
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
        const res = await orgConfigRequest(
            context,
            orgId,
            { headers: { Authorization: `Bearer ${token.value}` } },
            "get org config"
        );

        const data = (await res.json()) as OrgConfigResponse;

        if (json) {
            process.stdout.write(JSON.stringify(data, null, 2) + "\n");
            return;
        }

        if (data.cliVersionMin == null && data.cliVersionMax == null) {
            context.logger.info(`No org-level CLI config set for "${orgId}".`);
            return;
        }
        const { cliVersionMin, cliVersionMax } = data;
        if (cliVersionMin != null && cliVersionMin === cliVersionMax) {
            context.logger.info(`Fern CLI pinned to ${chalk.green(cliVersionMin)}`);
        } else if (cliVersionMin != null && cliVersionMax != null) {
            context.logger.info(
                `Fern CLI must be between ${chalk.green(cliVersionMin)} and ${chalk.green(cliVersionMax)}`
            );
        } else if (cliVersionMin != null) {
            context.logger.info(`Fern CLI must be at least ${chalk.green(cliVersionMin)}`);
        } else if (cliVersionMax != null) {
            context.logger.info(`Fern CLI must be at most ${chalk.green(cliVersionMax)}`);
        }
    });
}

const FERN_CLI_PACKAGE_NAME = "fern-api";

/**
 * Verifies `version` is an actual published release of the Fern CLI on npm, not
 * just a well-formed semver. A floor/ceiling set to a version that doesn't
 * exist would make every project in the org fail to re-exec (npx can't download
 * it), so we reject it up front. Fails open on registry/network errors — we
 * only block when npm explicitly reports the version is missing.
 */
async function assertCliVersionIsPublished(cliContext: CliContext, version: string): Promise<void> {
    try {
        await latestVersion(FERN_CLI_PACKAGE_NAME, { version });
    } catch (err) {
        if (err instanceof VersionNotFoundError) {
            cliContext.failAndThrow(
                `Fern CLI version "${version}" was not found on npm. Set a published version — see https://www.npmjs.com/package/${FERN_CLI_PACKAGE_NAME}?activeTab=versions.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
            return;
        }
        // Couldn't reach the registry — can't prove the version is invalid, so don't block.
        cliContext.logger.debug(`Could not verify Fern CLI version "${version}" exists on npm: ${String(err)}`);
    }
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
        if (version != null && !isValidVersion(version)) {
            cliContext.failAndThrow(
                `"${version}" isn't a valid version. Pass an exact published version like 5.45.0 (or a prerelease like 5.45.0-rc0) — see https://www.npmjs.com/package/${FERN_CLI_PACKAGE_NAME}?activeTab=versions.`,
                undefined,
                { code: CliError.Code.ConfigError }
            );
            return;
        }
    }
    if (min != null && max != null && isVersionAhead(min, max)) {
        cliContext.failAndThrow(`Minimum version ${min} must not be greater than maximum version ${max}.`, undefined, {
            code: CliError.Code.ConfigError
        });
        return;
    }
    for (const version of [min, max]) {
        if (version != null) {
            await assertCliVersionIsPublished(cliContext, version);
        }
    }

    const token = await getAuthToken(cliContext);
    const orgId = await resolveOrgId(cliContext, org);

    // Only the check for min/max supplied together is done here. Ordering
    // against the *already-stored* bound (e.g. setting a ceiling below an
    // existing floor via a separate command) is enforced by FDR, which merges
    // the update into the existing config and rejects an out-of-order pair.
    const requestBody: { cliVersionMin?: string; cliVersionMax?: string } = {};
    if (min != null) {
        requestBody.cliVersionMin = min;
    }
    if (max != null) {
        requestBody.cliVersionMax = max;
    }

    await cliContext.runTask(async (context) => {
        await orgConfigRequest(
            context,
            orgId,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token.value}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(requestBody)
            },
            "set org config"
        );

        if (min != null && max != null && min === max) {
            context.logger.info(`Pinned CLI version to ${chalk.green(min)} for org "${orgId}".`);
        } else if (min != null && max != null) {
            context.logger.info(`Set CLI version range to ${chalk.green(`${min} – ${max}`)} for org "${orgId}".`);
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
        const init: RequestInit =
            field === "all"
                ? { method: "DELETE", headers: { Authorization: `Bearer ${token.value}` } }
                : {
                      method: "PUT",
                      headers: {
                          Authorization: `Bearer ${token.value}`,
                          "Content-Type": "application/json"
                      },
                      body: JSON.stringify(field === "min" ? { cliVersionMin: null } : { cliVersionMax: null })
                  };
        await orgConfigRequest(context, orgId, init, "unset org config");

        const label = field === "min" ? "minimum" : field === "max" ? "maximum" : "minimum and maximum";
        context.logger.info(`Removed ${label} CLI version for org "${orgId}".`);
    });
}

/**
 * Result of a bounds fetch. `ok: true` means the endpoint answered
 * successfully (the org may still have no bounds set, i.e. empty `bounds`);
 * `ok: false` means the fetch failed (network error, timeout, non-2xx). Callers
 * must distinguish these: a failed fetch fails open (no clamping) rather than
 * being treated as "no bounds".
 */
export type OrgCliVersionBoundsResult = { ok: true; bounds: OrgCliVersionBounds } | { ok: false };

/** Passes through a well-formed version bound, dropping anything malformed. */
function sanitizeBound(version: string | undefined): string | undefined {
    return version != null && isValidVersion(version) ? version : undefined;
}

/**
 * Fetches the org-level CLI version bounds (min/max). Returns a discriminated
 * result so callers can tell "successfully fetched, none set" apart from "fetch
 * failed" — the two used to be indistinguishable ({}), which let a transient
 * failure be misread as "no bounds".
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
}): Promise<OrgCliVersionBoundsResult> {
    try {
        const res = await fetch(`${FDR_ORIGIN}/v2/registry/org-config/${orgId}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: timeoutMs != null ? AbortSignal.timeout(timeoutMs) : undefined
        });
        if (!res.ok) {
            cliContext.logger.debug(`Failed to fetch org config: HTTP ${res.status}`);
            return { ok: false };
        }
        const data = (await res.json()) as OrgConfigResponse;
        // FDR is the source of truth, but validate its response before trusting
        // it in version comparisons — a malformed bound is dropped rather than
        // fed into isVersionAhead (still a successful response).
        return {
            ok: true,
            bounds: { min: sanitizeBound(data.cliVersionMin), max: sanitizeBound(data.cliVersionMax) }
        };
    } catch (err) {
        cliContext.logger.debug(`Failed to fetch org config: ${describeFetchError(err)}`);
        return { ok: false };
    }
}

export const ORG_BOUNDS_FETCH_TIMEOUT_MS = 2500;

/**
 * Resolves the org-level CLI version bounds for use in the version-redirection
 * path by fetching directly from FDR on every command, using a tight timeout.
 * Fails open (returns empty bounds) on any error — missing auth, network
 * failure, timeout — so the bounds never block a command.
 */
async function getOrgCliVersionBounds({
    cliContext,
    orgId
}: {
    cliContext: CliContext;
    orgId: string;
}): Promise<OrgCliVersionBounds> {
    // FERN_IGNORE_ORG_VERSION_FLOOR is the original name, kept as an alias.
    if (process.env.FERN_IGNORE_ORG_VERSION_BOUNDS === "true" || process.env.FERN_IGNORE_ORG_VERSION_FLOOR === "true") {
        return {};
    }

    try {
        const token = await getToken();
        if (token == null) {
            return {};
        }
        const result = await fetchOrgCliVersionBounds({
            cliContext,
            orgId,
            token: token.value,
            timeoutMs: ORG_BOUNDS_FETCH_TIMEOUT_MS
        });
        // A failed fetch falls open (empty bounds) so a transient blip never
        // blocks a command.
        if (!result.ok) {
            return {};
        }
        return result.bounds;
    } catch (err) {
        cliContext.logger.debug(`Failed to resolve org CLI version bounds: ${String(err)}`);
        return {};
    }
}

/**
 * Fetches the org's bounds and clamps `version` into them, failing open
 * to `{ version }` (no reason) on any error. Shared by the redirection and
 * warn-only paths below.
 */
async function resolveClampedVersionForOrg({
    cliContext,
    orgId,
    version
}: {
    cliContext: CliContext;
    orgId: string;
    version: string;
}): Promise<{ version: string; reason?: ClampReason }> {
    const bounds = await getOrgCliVersionBounds({ cliContext, orgId });
    try {
        return clampVersionToOrgBounds(version, bounds);
    } catch {
        // version comparison failed — fail open, don't clamp
        return { version };
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
    const { version, reason } = await resolveClampedVersionForOrg({ cliContext, orgId, version: intendedVersion });
    if (reason === "pin") {
        cliContext.logger.info(
            `Org "${orgId}" pins Fern CLI to ${chalk.green(version)} — running ${chalk.green(version)}.`
        );
    } else if (reason === "floor") {
        cliContext.logger.info(
            `Org "${orgId}" requires Fern CLI ${chalk.green(`>= ${version}`)} — running ${chalk.green(version)}.`
        );
    } else if (reason === "ceiling") {
        cliContext.logger.info(
            `Org "${orgId}" caps Fern CLI at ${chalk.green(`<= ${version}`)} — running ${chalk.green(version)}.`
        );
    }
    return version;
}

/**
 * Warns (without changing the running version) when the current CLI is outside
 * the org bounds while version redirection is disabled
 * (`FERN_NO_VERSION_REDIRECTION`). This is the case for local dev builds, where
 * the redirection layer that would normally re-exec at the bound never runs —
 * so the enforcement banner would otherwise be invisible. Compares the running
 * version (not the project pin) so a correctly re-exec'd child, which already
 * runs an in-range version, does not warn. Fails open on any error.
 */
export async function warnIfVersionOutsideOrgBounds({
    cliContext,
    orgId,
    currentVersion
}: {
    cliContext: CliContext;
    orgId: string;
    currentVersion: string;
}): Promise<void> {
    const { version, reason } = await resolveClampedVersionForOrg({ cliContext, orgId, version: currentVersion });
    if (reason === "pin") {
        cliContext.logger.warn(
            `Org "${orgId}" pins Fern CLI to ${chalk.yellow(version)}, but this CLI is ${chalk.yellow(currentVersion)}. Version redirection is disabled, so it was not changed.`
        );
    } else if (reason === "floor") {
        cliContext.logger.warn(
            `Org "${orgId}" requires Fern CLI ${chalk.yellow(`>= ${version}`)}, but this CLI is ${chalk.yellow(currentVersion)}. Version redirection is disabled, so it was not upgraded.`
        );
    } else if (reason === "ceiling") {
        cliContext.logger.warn(
            `Org "${orgId}" caps Fern CLI at ${chalk.yellow(`<= ${version}`)}, but this CLI is ${chalk.yellow(currentVersion)}. Version redirection is disabled, so it was not downgraded.`
        );
    }
}
