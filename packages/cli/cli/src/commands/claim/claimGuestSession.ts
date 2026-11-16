import {
    getClaimSecret,
    readStoredGuestSession,
    removeStoredGuestSession,
    type StoredGuestSession
} from "@fern-api/auth";
import {
    FERN_DIRECTORY,
    getFernDirectory,
    loadProjectConfig,
    PROJECT_CONFIG_FILENAME
} from "@fern-api/configuration-loader";
import { createVenusService } from "@fern-api/core";
import { assertNeverNoThrow } from "@fern-api/core-utils";
import { createDocsAnonymousClient } from "@fern-api/fdr-sdk/orpc-client";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { askToLogin } from "@fern-api/login";
import { getFernSdkGenApiOrigin } from "@fern-api/remote-workspace-runner";
import { CliError, InstructionsTopic } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { produce } from "immer";

import { CliContext } from "../../cli-context/CliContext.js";
import { ensureFinalNewline } from "../../utils/ensureFinalNewline.js";

export interface ClaimRequest {
    /** The Venus the session was issued by; the claim has to go to the same one. */
    venusOrigin: string;
    token: string;
    sessionId: string;
    claimSecret: string;
    organizationId: string | undefined;
}

export type ClaimResult =
    | { ok: true; organizationId: string; nextSteps: string[] }
    | { ok: false; statusCode: number | undefined; message: string | undefined };

export type Claim = (request: ClaimRequest) => Promise<ClaimResult>;

export interface ReadSessionRequest {
    venusOrigin: string;
    sessionId: string;
    claimSecret: string;
}

/** Where Venus has the session; `unknown` when it could not be read, so the claim is just attempted. */
export type SessionState = { kind: "claimed"; organizationId: string } | { kind: "unclaimed" } | { kind: "unknown" };

export type ReadSession = (request: ReadSessionRequest) => Promise<SessionState>;

export interface MoveDocsRequest {
    token: string;
    guestOrganizationId: string;
    /** The address the published site takes instead of its drop host. */
    docsUrl: string | undefined;
}

export interface MovedSite {
    domain: string;
    previousDomain: string | undefined;
}

export type MoveFailure = { kind: "failed"; statusCode: number | undefined; reason: string | undefined };

export type MoveDocsResult = { kind: "moved"; sites: MovedSite[] } | MoveFailure;

export type MoveDocs = (request: MoveDocsRequest) => Promise<MoveDocsResult>;

export interface MoveSdksRequest {
    token: string;
    /** The organization the session was claimed into. */
    organizationId: string;
    guestOrganizationId: string;
    sdkName: string | undefined;
}

export type MoveSdksResult = { kind: "moved"; buildIds: string[] } | { kind: "not_configured" } | MoveFailure;

export type MoveSdks = (request: MoveSdksRequest) => Promise<MoveSdksResult>;

/**
 * `fern claim [--org]`: claims the guest session recorded in this repo with the signed-in user, then
 * moves its docs sites (FDR) and SDK builds (sdk-gen-api) into the organization that now owns it, the
 * same moves the dashboard's claim page makes. Points fern.config.json at that organization and
 * forgets the session once everything moved; a failed move keeps the session so a rerun retries it.
 */
export async function claimGuestSession({
    cliContext,
    organization,
    docsUrl,
    sdkName,
    absolutePathToFernDirectory,
    claim = claimWithVenus,
    readSession = readSessionFromVenus,
    moveDocs = moveDocsWithFdr,
    moveSdks = moveSdksWithSdkGenApi
}: {
    cliContext: CliContext;
    organization: string | undefined;
    docsUrl?: string;
    sdkName?: string;
    absolutePathToFernDirectory?: AbsoluteFilePath;
    claim?: Claim;
    readSession?: ReadSession;
    moveDocs?: MoveDocs;
    moveSdks?: MoveSdks;
}): Promise<void> {
    const fernDirectory = absolutePathToFernDirectory ?? (await getFernDirectory());
    if (fernDirectory == null) {
        return cliContext.failAndThrow(`Directory "${FERN_DIRECTORY}" not found.`, undefined, {
            code: CliError.Code.ConfigError,
            instructionsTopic: InstructionsTopic.NewSite
        });
    }

    const stored = await readStoredGuestSession({ absolutePathToFernDirectory: fernDirectory });
    if (stored == null) {
        return cliContext.failAndThrow(
            "No guest session is recorded for this repo. Run `fern generate --guest` first, then claim it.",
            undefined,
            { code: CliError.Code.ConfigError, instructionsTopic: InstructionsTopic.NewSite }
        );
    }
    const claimSecret = getClaimSecret(stored.claimUrl);
    if (claimSecret == null) {
        return cliContext.failAndThrow(
            `The recorded guest session has no claim secret. Open ${stored.claimUrl} in a browser to claim it.`,
            undefined,
            { code: CliError.Code.ConfigError, instructionsTopic: InstructionsTopic.NewSite }
        );
    }

    const token = await cliContext.runTask((context) => askToLogin(context));
    if (token.type !== "user") {
        return cliContext.failAndThrow(
            "Claiming needs a signed-in user. Unset the FERN_TOKEN environment variable and run `fern login`, then retry `fern claim`.",
            undefined,
            { code: CliError.Code.AuthError, instructionsTopic: InstructionsTopic.NewSite }
        );
    }

    // A rerun after a failed move: Venus already has the claim, so only the moves are retried.
    const state = await readSession({ venusOrigin: stored.venusOrigin, sessionId: stored.sessionId, claimSecret });
    let organizationId: string;
    let nextSteps: string[] = [];
    if (state.kind === "claimed") {
        organizationId = state.organizationId;
        if (organization != null && organization !== organizationId) {
            cliContext.logger.warn(
                `Guest session ${stored.sessionId} is already claimed into ${organizationId}; --org ${organization} is ignored.`
            );
        }
        cliContext.logger.info(
            `Guest session ${chalk.bold(stored.sessionId)} is already claimed into ${chalk.bold(organizationId)}; moving its work there.`
        );
    } else {
        const result = await cliContext.runTask(() =>
            claim({
                venusOrigin: stored.venusOrigin,
                token: token.value,
                sessionId: stored.sessionId,
                claimSecret,
                organizationId: organization
            })
        );
        if (!result.ok) {
            return cliContext.failAndThrow(describeClaimFailure(result, stored, organization), undefined, {
                code:
                    result.statusCode === 401 || result.statusCode === 403
                        ? CliError.Code.AuthError
                        : CliError.Code.NetworkError
            });
        }
        organizationId = result.organizationId;
        nextSteps = result.nextSteps;
        cliContext.logger.info(
            `Claimed guest session ${chalk.bold(stored.sessionId)} into organization ${chalk.bold(organizationId)}.`
        );
    }

    const [docs, sdks] = await cliContext.runTask(() =>
        Promise.all([
            moveDocs({ token: token.value, guestOrganizationId: stored.organizationId, docsUrl }),
            moveSdks({ token: token.value, organizationId, guestOrganizationId: stored.organizationId, sdkName })
        ])
    );

    const projectConfig = await cliContext.runTask((context) =>
        loadProjectConfig({ directory: fernDirectory, context })
    );
    if (projectConfig.rawConfig.organization !== organizationId) {
        const updated = produce(projectConfig.rawConfig, (draft) => {
            draft.organization = organizationId;
        });
        await writeFile(projectConfig._absolutePath, ensureFinalNewline(JSON.stringify(updated, undefined, 2)));
        cliContext.logger.info(
            `Updated ${PROJECT_CONFIG_FILENAME}: organization is now ${chalk.bold(organizationId)}.`
        );
    }

    const failures: string[] = [];
    if (docs.kind === "moved") {
        for (const site of docs.sites) {
            cliContext.logger.info(
                site.previousDomain != null
                    ? `Docs site moved to ${chalk.bold(`https://${site.domain}`)} (from ${site.previousDomain}); it shows "getting ready" until the new address serves.`
                    : `Docs site ${chalk.bold(`https://${site.domain}`)} is now in ${organizationId}.`
            );
        }
    } else {
        failures.push(describeDocsMoveFailure(docs, docsUrl));
    }
    switch (sdks.kind) {
        case "moved":
            if (sdks.buildIds.length > 0) {
                cliContext.logger.info(`Moved ${sdks.buildIds.length} SDK build(s) into ${organizationId}.`);
            }
            break;
        case "not_configured":
            cliContext.logger.debug("No sdk-gen-api origin is configured; SDK builds were not moved.");
            break;
        case "failed":
            failures.push(describeSdkMoveFailure(sdks, sdkName));
            break;
        default:
            assertNeverNoThrow(sdks);
    }

    if (failures.length > 0) {
        return cliContext.failAndThrow(
            [
                `Guest session ${stored.sessionId} is claimed into ${organizationId}, but not all of its work moved:`,
                ...failures.map((failure) => `  - ${failure}`),
                "Run `fern claim` again to retry; the claim itself is not repeated."
            ].join("\n"),
            undefined,
            { code: CliError.Code.NetworkError, instructionsTopic: InstructionsTopic.NewSite }
        );
    }

    await removeStoredGuestSession({ sessionId: stored.sessionId, absolutePathToFernDirectory: fernDirectory });
    cliContext.logger.info(
        "The guest session's token no longer works; run `fern login` or set FERN_TOKEN to keep generating."
    );
    for (const step of nextSteps) {
        cliContext.logger.info(`  - ${step}`);
    }
}

async function claimWithVenus({
    venusOrigin,
    token,
    sessionId,
    claimSecret,
    organizationId
}: ClaimRequest): Promise<ClaimResult> {
    const response = await createVenusService({ environment: venusOrigin, token }).guestSession.claim(
        { sessionId, organizationId },
        { headers: { "X-Fern-Claim-Secret": claimSecret } }
    );
    if (response.ok) {
        return { ok: true, organizationId: response.body.organizationId, nextSteps: response.body.nextSteps ?? [] };
    }
    const error = response.error as { statusCode?: number; content?: unknown };
    return { ok: false, statusCode: error.statusCode, message: readSuggestedFix(error.content) };
}

async function readSessionFromVenus({
    venusOrigin,
    sessionId,
    claimSecret
}: ReadSessionRequest): Promise<SessionState> {
    try {
        const response = await createVenusService({ environment: venusOrigin, token: undefined }).guestSession.get(
            { sessionId },
            { headers: { "X-Fern-Claim-Secret": claimSecret } }
        );
        if (!response.ok) {
            return { kind: "unknown" };
        }
        if (response.body.status === "claimed") {
            // No claimedOrganizationId means the guest organization itself became the claimant's.
            return {
                kind: "claimed",
                organizationId: response.body.claimedOrganizationId ?? response.body.organizationId
            };
        }
        return { kind: "unclaimed" };
    } catch {
        // The claim call reports what is actually wrong.
        return { kind: "unknown" };
    }
}

async function moveDocsWithFdr({ token, guestOrganizationId, docsUrl }: MoveDocsRequest): Promise<MoveDocsResult> {
    try {
        const moved = await createDocsAnonymousClient({ baseUrl: getFdrOrigin(), token }).rehomeGuestSession({
            guestOrgId: guestOrganizationId,
            ...(docsUrl == null ? {} : { domain: docsUrl })
        });
        return {
            kind: "moved",
            sites: moved.sites.map((site) => ({ domain: site.domain, previousDomain: site.previousDomain }))
        };
    } catch (error) {
        return { kind: "failed", statusCode: readStatus(error), reason: readReason(error) };
    }
}

async function moveSdksWithSdkGenApi({
    token,
    organizationId,
    guestOrganizationId,
    sdkName
}: MoveSdksRequest): Promise<MoveSdksResult> {
    const origin = getFernSdkGenApiOrigin();
    if (origin == null) {
        return { kind: "not_configured" };
    }
    try {
        const response = await fetch(`${origin}/v1/fern/build/guest-session/rehome`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "X-Fern-Organization-Id": organizationId,
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ guestOrgId: guestOrganizationId, ...(sdkName == null ? {} : { sdkName }) }),
            signal: AbortSignal.timeout(MOVE_TIMEOUT_MS)
        });
        const body: unknown = await response.json().catch(() => undefined);
        if (!response.ok) {
            const reason = isRecord(body) && body.code === "SDK_NAME_TAKEN" ? "sdk_name_taken" : undefined;
            return { kind: "failed", statusCode: response.status, reason };
        }
        const builds = isRecord(body) && Array.isArray(body.builds) ? body.builds : [];
        return {
            kind: "moved",
            buildIds: builds.flatMap((build) =>
                isRecord(build) && typeof build.buildId === "string" ? [build.buildId] : []
            )
        };
    } catch {
        return { kind: "failed", statusCode: undefined, reason: undefined };
    }
}

const MOVE_TIMEOUT_MS = 60_000;

function getFdrOrigin(): string {
    return (
        process.env["FERN_FDR_ORIGIN"] ??
        process.env["OVERRIDE_FDR_ORIGIN"] ??
        process.env["DEFAULT_FDR_ORIGIN"] ??
        "https://registry.buildwithfern.com"
    );
}

function describeDocsMoveFailure(result: MoveFailure, docsUrl: string | undefined): string {
    switch (result.statusCode) {
        case 400:
            return `Docs: ${docsUrl ?? "the address"} is not a valid docs address. Retry with another --docs-url.`;
        case 401:
        case 403:
            return "Docs: you are not an admin of the organization, so its docs sites could not be moved.";
        case 409:
            return result.reason === "domain_taken"
                ? `Docs: ${docsUrl ?? "that address"} is already taken. Retry with another --docs-url.`
                : "Docs: the sites could not be moved (conflict).";
        default:
            return `Docs: the sites could not be moved${result.statusCode != null ? ` (status ${result.statusCode})` : ""}.`;
    }
}

function describeSdkMoveFailure(result: MoveFailure, sdkName: string | undefined): string {
    switch (result.statusCode) {
        case 401:
        case 403:
            return "SDKs: you are not a member of the organization, so its SDK builds could not be moved.";
        case 409:
            return result.reason === "sdk_name_taken"
                ? `SDKs: the organization already has an SDK named ${sdkName ?? "that"}. Retry with another --sdk-name.`
                : "SDKs: the builds could not be moved (conflict).";
        default:
            return `SDKs: the builds could not be moved${result.statusCode != null ? ` (status ${result.statusCode})` : ""}.`;
    }
}

function describeClaimFailure(
    result: Extract<ClaimResult, { ok: false }>,
    stored: StoredGuestSession,
    organization: string | undefined
): string {
    const suffix = result.message != null ? ` ${result.message}` : "";
    switch (result.statusCode) {
        case 401:
            return `Venus rejected your login while claiming guest session ${stored.sessionId}. Run \`fern login\` and retry.${suffix}`;
        case 403:
            return organization != null
                ? `You are not an admin of organization "${organization}", so the guest session cannot be moved there.${suffix}`
                : `Venus refused to claim guest session ${stored.sessionId}.${suffix}`;
        case 404:
            return `Venus has no guest session ${stored.sessionId} for this claim secret. It may have been deleted; run \`fern generate --guest\` to start a new one.${suffix}`;
        case 410:
            return `Guest session ${stored.sessionId} has nothing left to claim (expired, taken down or already claimed). Run \`fern generate --guest\` to start a new one.${suffix}`;
        default:
            return `Failed to claim guest session ${stored.sessionId}${result.statusCode != null ? ` (status ${result.statusCode})` : ""}.${suffix}`;
    }
}

function readSuggestedFix(body: unknown): string | undefined {
    if (typeof body !== "object" || body == null) {
        return undefined;
    }
    const record = body as Record<string, unknown>;
    const content =
        typeof record.content === "object" && record.content != null
            ? (record.content as Record<string, unknown>)
            : record;
    return typeof content.suggestedFix === "string" ? content.suggestedFix : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null;
}

function readStatus(error: unknown): number | undefined {
    return isRecord(error) && typeof error.status === "number" ? error.status : undefined;
}

/** The `reason` FDR and sdk-gen-api put in an error's data, such as `domain_taken`. */
function readReason(error: unknown): string | undefined {
    if (!isRecord(error) || !isRecord(error.data)) {
        return undefined;
    }
    return typeof error.data.reason === "string" ? error.data.reason : undefined;
}
