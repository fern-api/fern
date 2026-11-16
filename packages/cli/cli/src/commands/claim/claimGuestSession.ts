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
import { assertNever, assertNeverNoThrow, delay } from "@fern-api/core-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, InstructionsTopic } from "@fern-api/task-context";
import chalk from "chalk";
import { writeFile } from "fs/promises";
import { produce } from "immer";
import open from "open";

import { CliContext } from "../../cli-context/CliContext.js";
import { ensureFinalNewline } from "../../utils/ensureFinalNewline.js";

export interface ReadSessionRequest {
    /** The Venus the session was issued by. */
    venusOrigin: string;
    sessionId: string;
    claimSecret: string;
}

export type SessionState =
    | { kind: "unclaimed" }
    | { kind: "claimed"; organizationId: string }
    | { kind: "gone"; status: string }
    | { kind: "not_found" }
    | { kind: "unreachable"; statusCode: number | undefined };

export type ReadSession = (request: ReadSessionRequest) => Promise<SessionState>;
export type OpenBrowser = (url: string) => Promise<void>;

const DEFAULT_POLL_INTERVAL_MS = 3_000;
const DEFAULT_TIMEOUT_MS = 30 * 60 * 1_000;

/**
 * `fern claim`: opens the session's claim link in the browser, where the dashboard runs the whole claim (pick
 * or create the organization, rename the site, move the docs and SDK builds). Meanwhile it waits for Venus to
 * report the session claimed, then points fern.config.json at the organization that now owns the work and
 * forgets the session.
 */
export async function claimGuestSession({
    cliContext,
    absolutePathToFernDirectory,
    readSession = readSessionFromVenus,
    openBrowser = openInBrowser,
    sleep = delay,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    now = Date.now
}: {
    cliContext: CliContext;
    absolutePathToFernDirectory?: AbsoluteFilePath;
    readSession?: ReadSession;
    openBrowser?: OpenBrowser;
    sleep?: (ms: number) => Promise<void>;
    pollIntervalMs?: number;
    timeoutMs?: number;
    now?: () => number;
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
    const request = { venusOrigin: stored.venusOrigin, sessionId: stored.sessionId, claimSecret };

    let state = await readSession(request);
    if (state.kind === "unclaimed" || state.kind === "unreachable") {
        cliContext.logger.info(`Opening the claim page for guest session ${chalk.bold(stored.sessionId)}:`);
        cliContext.logger.info(`  ${chalk.cyan(stored.claimUrl)}`);
        try {
            await openBrowser(stored.claimUrl);
        } catch {
            cliContext.logger.info("Couldn't open a browser automatically. Open the link above to claim the session.");
        }
        cliContext.logger.info("Finish the claim in the browser. Waiting for it here (Ctrl+C to stop)...");

        const deadline = now() + timeoutMs;
        while (state.kind === "unclaimed" || state.kind === "unreachable") {
            if (state.kind === "unreachable") {
                cliContext.logger.debug(
                    `Could not read guest session ${stored.sessionId}${state.statusCode != null ? ` (status ${state.statusCode})` : ""}; retrying.`
                );
            }
            if (now() >= deadline) {
                return cliContext.failAndThrow(
                    `Guest session ${stored.sessionId} was not claimed within ${Math.round(timeoutMs / 60_000)} minutes. Claim it at ${stored.claimUrl}, then run \`fern claim\` again to update ${PROJECT_CONFIG_FILENAME}.`,
                    undefined,
                    { code: CliError.Code.NetworkError, instructionsTopic: InstructionsTopic.NewSite }
                );
            }
            await sleep(pollIntervalMs);
            state = await readSession(request);
        }
    }

    switch (state.kind) {
        case "claimed":
            return finishClaim({ cliContext, fernDirectory, stored, organizationId: state.organizationId });
        case "gone":
            return cliContext.failAndThrow(
                `Guest session ${stored.sessionId} can no longer be claimed (${state.status}). Run \`fern generate --guest --new-session\` to start a new one.`,
                undefined,
                { code: CliError.Code.ConfigError, instructionsTopic: InstructionsTopic.NewSite }
            );
        case "not_found":
            return cliContext.failAndThrow(
                `Venus has no guest session ${stored.sessionId} for this claim secret. It may have been deleted; run \`fern generate --guest --new-session\` to start a new one.`,
                undefined,
                { code: CliError.Code.ConfigError, instructionsTopic: InstructionsTopic.NewSite }
            );
        default:
            assertNever(state);
    }
}

async function finishClaim({
    cliContext,
    fernDirectory,
    stored,
    organizationId
}: {
    cliContext: CliContext;
    fernDirectory: AbsoluteFilePath;
    stored: StoredGuestSession;
    organizationId: string;
}): Promise<void> {
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
    await removeStoredGuestSession({ sessionId: stored.sessionId, absolutePathToFernDirectory: fernDirectory });

    cliContext.logger.info(
        `Claimed guest session ${chalk.bold(stored.sessionId)} into organization ${chalk.bold(organizationId)}. Its guest token no longer works; run \`fern login\` or set FERN_TOKEN to keep generating.`
    );
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
            const statusCode = (response.error as { statusCode?: number }).statusCode;
            switch (statusCode) {
                case 404:
                    return { kind: "not_found" };
                case 410:
                    return { kind: "gone", status: "expired, deleted or taken down" };
                default:
                    return { kind: "unreachable", statusCode };
            }
        }
        const { status } = response.body;
        switch (status) {
            case "claimed":
                // No claimedOrganizationId means the guest organization itself became the claimant's.
                return {
                    kind: "claimed",
                    organizationId: response.body.claimedOrganizationId ?? response.body.organizationId
                };
            case "active":
            case "claiming":
                return { kind: "unclaimed" };
            case "expired":
            case "deleted":
            case "takenDown":
                return { kind: "gone", status };
            default:
                // A status this CLI doesn't know yet: keep waiting rather than fail.
                assertNeverNoThrow(status);
                return { kind: "unreachable", statusCode: undefined };
        }
    } catch {
        // Network errors are retried by the caller until its deadline.
        return { kind: "unreachable", statusCode: undefined };
    }
}

async function openInBrowser(url: string): Promise<void> {
    await open(url);
}
