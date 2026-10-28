import { isEnoentError } from "@fern-api/core-utils";
import { AbsoluteFilePath, dirname, doesPathExist, join, RelativeFilePath } from "@fern-api/fs-utils";
import { chmod, mkdir, readFile, unlink, writeFile } from "fs/promises";
import { homedir } from "os";

import { FernGuestToken } from "../FernToken.js";

const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";
const GUEST_SESSIONS_FOLDER = "guest-sessions";
/** Written next to fern.config.json so every shell in the same repo reuses one guest org. */
export const GUEST_SESSION_POINTER_FILENAME = ".guest-session";

export interface StoredGuestSession {
    sessionId: string;
    organizationId: string;
    token: string;
    claimUrl: string;
    expiresAt: string;
    venusOrigin: string;
}

export function getPathToGuestSessionFile(sessionId: string): AbsoluteFilePath {
    return join(
        AbsoluteFilePath.of(homedir()),
        RelativeFilePath.of(LOCAL_STORAGE_FOLDER),
        RelativeFilePath.of(GUEST_SESSIONS_FOLDER),
        RelativeFilePath.of(`${sanitizeSessionId(sessionId)}.json`)
    );
}

export function getPathToGuestSessionPointer(absolutePathToFernDirectory: AbsoluteFilePath): AbsoluteFilePath {
    return join(absolutePathToFernDirectory, RelativeFilePath.of(GUEST_SESSION_POINTER_FILENAME));
}

export async function readStoredGuestSession({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<StoredGuestSession | undefined> {
    const pointerPath = getPathToGuestSessionPointer(absolutePathToFernDirectory);
    if (!(await doesPathExist(pointerPath))) {
        return undefined;
    }
    const sessionId = (await readFile(pointerPath, "utf-8")).trim();
    if (sessionId.length === 0) {
        return undefined;
    }
    const sessionPath = getPathToGuestSessionFile(sessionId);
    if (!(await doesPathExist(sessionPath))) {
        return undefined;
    }
    try {
        const parsed: unknown = JSON.parse(await readFile(sessionPath, "utf-8"));
        return isStoredGuestSession(parsed) ? parsed : undefined;
    } catch {
        return undefined;
    }
}

export async function writeStoredGuestSession({
    session,
    absolutePathToFernDirectory
}: {
    session: StoredGuestSession;
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<void> {
    const sessionPath = getPathToGuestSessionFile(session.sessionId);
    await mkdir(dirname(sessionPath), { recursive: true, mode: 0o700 });
    await writeFile(sessionPath, JSON.stringify(session, null, 2), { mode: 0o600 });
    // `mode` only applies when the file is created; tighten a pre-existing file too.
    await chmod(sessionPath, 0o600);

    // Ignore the pointer before it exists, so a failure here never leaves a committable file behind.
    await ensureGitignored({ absolutePathToFernDirectory });
    await writeFile(getPathToGuestSessionPointer(absolutePathToFernDirectory), `${session.sessionId}\n`);
}

/** Forgets a session: removes the repo pointer and the credential file. Missing files are fine. */
export async function removeStoredGuestSession({
    sessionId,
    absolutePathToFernDirectory
}: {
    sessionId: string;
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<void> {
    // Credential first: a pointer without a file is harmless, a file without a pointer is unreachable.
    await unlinkIfExists(getPathToGuestSessionFile(sessionId));
    await unlinkIfExists(getPathToGuestSessionPointer(absolutePathToFernDirectory));
}

/** The claim secret travels in the fragment of the claim URL (`…/claim/<id>#<secret>`). */
export function getClaimSecret(claimUrl: string): string | undefined {
    const hash = claimUrl.indexOf("#");
    if (hash < 0) {
        return undefined;
    }
    let secret = claimUrl.slice(hash + 1).trim();
    try {
        secret = decodeURIComponent(secret);
    } catch {
        // not percent-encoded; use as-is
    }
    return secret.length > 0 ? secret : undefined;
}

async function unlinkIfExists(path: AbsoluteFilePath): Promise<void> {
    try {
        await unlink(path);
    } catch (error) {
        if (!isEnoentError(error)) {
            throw error;
        }
    }
}

export function isGuestSessionLive(session: Pick<StoredGuestSession, "expiresAt">, now: Date = new Date()): boolean {
    const expiresAt = new Date(session.expiresAt);
    return !Number.isNaN(expiresAt.getTime()) && expiresAt.getTime() > now.getTime();
}

export function toGuestToken(session: StoredGuestSession): FernGuestToken {
    return {
        type: "guest",
        value: session.token,
        sessionId: session.sessionId,
        organizationId: session.organizationId,
        claimUrl: session.claimUrl,
        expiresAt: new Date(session.expiresAt)
    };
}

/**
 * Best effort: appends the pointer to `fern/.gitignore` unless that file already lists it line-for-line. A rule in a
 * parent .gitignore, or a negation, is not detected.
 */
async function ensureGitignored({
    absolutePathToFernDirectory
}: {
    absolutePathToFernDirectory: AbsoluteFilePath;
}): Promise<void> {
    const gitignorePath = join(absolutePathToFernDirectory, RelativeFilePath.of(".gitignore"));
    const existing = (await doesPathExist(gitignorePath)) ? await readFile(gitignorePath, "utf-8") : "";
    const alreadyIgnored = existing
        .split(/\r?\n/)
        .map((line) => line.trim())
        .some((line) => line === GUEST_SESSION_POINTER_FILENAME || line === `/${GUEST_SESSION_POINTER_FILENAME}`);
    if (alreadyIgnored) {
        return;
    }
    const separator = existing.length === 0 || existing.endsWith("\n") ? "" : "\n";
    await writeFile(gitignorePath, `${existing}${separator}${GUEST_SESSION_POINTER_FILENAME}\n`);
}

function isStoredGuestSession(value: unknown): value is StoredGuestSession {
    if (typeof value !== "object" || value == null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    return (
        typeof record.sessionId === "string" &&
        typeof record.organizationId === "string" &&
        typeof record.token === "string" &&
        typeof record.claimUrl === "string" &&
        typeof record.expiresAt === "string" &&
        typeof record.venusOrigin === "string"
    );
}

function sanitizeSessionId(sessionId: string): string {
    return sessionId.replace(/[^A-Za-z0-9_-]/g, "_");
}
