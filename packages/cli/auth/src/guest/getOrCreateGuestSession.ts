import { createVenusService } from "@fern-api/core";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { CliError, TaskContext } from "@fern-api/task-context";
import type { FernVenusApi } from "@fern-api/venus-api-sdk";
import { createHash } from "crypto";
import { homedir, hostname } from "os";

import { FernGuestToken } from "../FernToken.js";
import {
    isGuestSessionLive,
    readStoredGuestSession,
    recordCurrentGuestSession,
    recordGuestSessionInRepo,
    type StoredGuestSession,
    toGuestToken,
    writeStoredGuestSession
} from "./GuestSession.js";

export type CreateGuestSession = (
    request: FernVenusApi.CreateGuestSessionRequest
) => Promise<FernVenusApi.CreateGuestSessionResponse>;

/**
 * Asks Venus whether a session is still active: "dead" when Venus says it is claimed, expired or gone (or no longer
 * accepts its token), "unknown" when Venus could not be reached -- then the local expiry is all there is to go on.
 */
export type CheckGuestSession = (session: StoredGuestSession) => Promise<"active" | "dead" | "unknown">;

/**
 * Returns the guest session recorded for this repo (`fern/.guest-session` -> `~/.fern/guest-sessions/<id>.json`),
 * or failing that the one this machine last used (`~/.fern/guest-sessions/current`, then pinned to this repo too),
 * while it is still live and was issued by the Venus the CLI is talking to now; otherwise mints a new one from
 * Venus and records it. Policy (limits, kill switch, expiry) is the server's; this only keeps the credential.
 */
export async function getOrCreateGuestSession({
    absolutePathToFernDirectory,
    cliVersion,
    context,
    createGuestSession = createGuestSessionWithVenus,
    checkGuestSession = checkGuestSessionWithVenus,
    forceNew = false,
    now = new Date()
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    createGuestSession?: CreateGuestSession;
    checkGuestSession?: CheckGuestSession;
    /**
     * Skip the stored session even if it looks live (`--new-session`). The local file only knows `expiresAt`; a
     * session claimed, revoked or killed on the Venus side still looks live here.
     */
    forceNew?: boolean;
    now?: Date;
}): Promise<{ token: FernGuestToken; reused: boolean }> {
    const stored = await readStoredGuestSession({ absolutePathToFernDirectory });
    if (!forceNew && stored != null && stored.venusOrigin === getVenusOrigin() && isGuestSessionLive(stored, now)) {
        if (stored.source === "repo") {
            // "current" is the session last used, not last minted: the next repo joins the one this run used.
            await recordCurrentGuestSession(stored.sessionId);
            return { token: toGuestToken(stored), reused: true };
        }
        // Another repo's session. The file only knows `expiresAt`, and a session claimed from the browser or
        // revoked still looks live here, so ask Venus before a new repo joins it rather than fail its first publish.
        if ((await checkGuestSession(stored)) !== "dead") {
            await recordGuestSessionInRepo({ sessionId: stored.sessionId, absolutePathToFernDirectory });
            return { token: toGuestToken(stored), reused: true };
        }
        context.logger.debug(
            `Guest session ${stored.sessionId} on this machine is no longer active; starting a new one.`
        );
    }

    let response: FernVenusApi.CreateGuestSessionResponse;
    try {
        response = await createGuestSession({ fingerprint: getFingerprint(), clientVersion: cliVersion });
    } catch (error) {
        return context.failAndThrow(
            "Could not start a guest session. Run 'fern login' or set the FERN_TOKEN environment variable.",
            error,
            { code: CliError.Code.AuthError }
        );
    }

    const session: StoredGuestSession = {
        sessionId: response.sessionId,
        organizationId: response.organizationId,
        token: response.token,
        claimUrl: response.claimUrl,
        expiresAt: response.expiresAt.toISOString(),
        venusOrigin: getVenusOrigin()
    };
    await writeStoredGuestSession({ session, absolutePathToFernDirectory });
    return { token: toGuestToken(session), reused: false };
}

async function checkGuestSessionWithVenus(session: StoredGuestSession): Promise<"active" | "dead" | "unknown"> {
    try {
        const response = await createVenusService({
            environment: session.venusOrigin,
            token: session.token
        }).guestSession.get({ sessionId: session.sessionId });
        if (response.ok) {
            return response.body.status === "active" ? "active" : "dead";
        }
        return response.error._visit<"dead" | "unknown">({
            notFoundError: () => "dead",
            goneError: () => "dead",
            unprocessableEntityError: () => "unknown",
            serviceUnavailableError: () => "unknown",
            // Venus refused the session's own token (401/403): it has been revoked.
            _other: (fetcherError) =>
                fetcherError.reason === "status-code" &&
                (fetcherError.statusCode === 401 || fetcherError.statusCode === 403)
                    ? "dead"
                    : "unknown"
        });
    } catch {
        return "unknown";
    }
}

async function createGuestSessionWithVenus(
    request: FernVenusApi.CreateGuestSessionRequest
): Promise<FernVenusApi.CreateGuestSessionResponse> {
    const response = await createVenusService({ token: undefined }).guestSession.create(request);
    if (response.ok) {
        return response.body;
    }
    throw new Error(describeCreateError(response.error));
}

function describeCreateError(error: FernVenusApi.guestSession.create.Error): string {
    return error._visit({
        serviceUnavailableError: (body) => readSuggestedFix(body) ?? "Guest sessions are currently unavailable.",
        tooManyRequestsError: (body) =>
            readSuggestedFix(body) ?? "Too many guest sessions were started from this machine.",
        unprocessableEntityError: () => "Venus rejected the guest session request.",
        _other: (fetcherError) => `Venus request failed: ${JSON.stringify(fetcherError)}`
    });
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

/** Stable per machine and user, never sent anywhere else; Venus uses it only to rate-limit issuance. */
function getFingerprint(): string {
    return createHash("sha256").update(`${hostname()}\n${homedir()}`).digest("hex");
}

function getVenusOrigin(): string {
    return process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com";
}
