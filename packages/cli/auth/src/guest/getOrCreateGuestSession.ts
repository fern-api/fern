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
    type StoredGuestSession,
    toGuestToken,
    writeStoredGuestSession
} from "./GuestSession.js";

export type CreateGuestSession = (
    request: FernVenusApi.CreateGuestSessionRequest
) => Promise<FernVenusApi.CreateGuestSessionResponse>;

/**
 * Returns the guest session recorded for this repo (`fern/.guest-session` -> `~/.fern/guest-sessions/<id>.json`)
 * while it is still live, otherwise mints a new one from Venus and records it. Policy (limits, kill switch,
 * expiry) is the server's; this only keeps the credential.
 */
export async function getOrCreateGuestSession({
    absolutePathToFernDirectory,
    cliVersion,
    context,
    createGuestSession = createGuestSessionWithVenus,
    now = new Date()
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
    cliVersion: string;
    context: TaskContext;
    createGuestSession?: CreateGuestSession;
    now?: Date;
}): Promise<{ token: FernGuestToken; reused: boolean }> {
    const stored = await readStoredGuestSession({ absolutePathToFernDirectory });
    if (stored != null && isGuestSessionLive(stored, now)) {
        return { token: toGuestToken(stored), reused: true };
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
