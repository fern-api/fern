/**
 * What a server told a guest run when it refused the request. `code` is the Venus problem code when one came
 * through (Fiddle/FDR relay Venus's `{ code, suggestedFix, ... }` bodies); `message` is the server's own wording.
 */
export interface GuestRejection {
    statusCode: number | undefined;
    code: string | undefined;
    message: string | undefined;
}

/** The session itself is gone: nothing a new session would lose. */
const SESSION_ENDED_CODES = new Set(["GUEST_SESSION_EXPIRED", "GUEST_SESSION_TAKEN_DOWN", "GUEST_SESSION_NOT_FOUND"]);
/** The work moved into an organization; the guest token is simply retired. */
const SESSION_CLAIMED_CODES = new Set(["GUEST_SESSION_CLAIMED", "GUEST_SESSION_CLAIMING"]);
const LIMIT_CODE = "GUEST_LIMIT_REACHED";
const REJECTION_STATUSES = new Set([401, 403, 404, 409, 410, 429]);

export const NEW_SESSION_HINT = "Start a fresh one with 'fern generate --guest --new-session'.";
const ACCOUNT_HINT = "Claim the session (fern claim) or run 'fern login' to continue with an account.";

/** Whether an error from Fiddle/FDR/Venus is about the guest session or its permissions at all. */
export function isGuestRejection({ statusCode, code }: GuestRejection): boolean {
    return (statusCode != null && REJECTION_STATUSES.has(statusCode)) || (code?.startsWith("GUEST_") ?? false);
}

/**
 * A guest-specific failure message. Only a session the server says has ended gets the `--new-session` advice:
 * a new session is a new guest organization, so following it after a limit or permission refusal would throw
 * away work that is still there.
 */
export function describeGuestRejection(rejection: GuestRejection): string {
    const { statusCode, code, message } = rejection;
    const detail = message != null ? ` ${message.trim().replace(/\.?$/, ".")}` : "";
    if (code != null && SESSION_ENDED_CODES.has(code)) {
        return `This guest session has ended (${code}).${detail} ${NEW_SESSION_HINT} Or run 'fern login' to continue with an account.`;
    }
    if (code != null && SESSION_CLAIMED_CODES.has(code)) {
        return `This guest session has been claimed into an organization (${code}).${detail} Its guest token is retired; run 'fern login' and generate from that organization.`;
    }
    if (code === LIMIT_CODE || statusCode === 429) {
        return `This guest session has used up its limit${code != null ? ` (${code})` : ""}.${detail} The session and its work are still there. ${ACCOUNT_HINT}`;
    }
    const status = statusCode != null ? `HTTP ${statusCode}` : "an auth error";
    return (
        `Fern refused this request for the guest session (${status}${code != null ? `, ${code}` : ""}).${detail} ` +
        "Guest sessions can only download and have per-session limits; this does not mean the session is gone — " +
        `'fern whoami' shows its status. ${ACCOUNT_HINT}`
    );
}

/**
 * Reads status, code and message out of the error shapes the generated SDK clients hand back: the fetcher error
 * (`{ reason: "status-code", statusCode, body }`) or its `{ content: … }` wrapper, with a body that is either a
 * Venus problem (`{ code, suggestedFix }`), a Fiddle/FDR envelope (`{ error, content: { code?, message? } }`) or a
 * plain `{ message }`.
 */
export function readGuestRejection(error: unknown): GuestRejection {
    const outer = asRecord(error);
    const fetcher = asRecord(outer?.content)?.reason === "status-code" ? asRecord(outer?.content) : outer;
    const statusCode = typeof fetcher?.statusCode === "number" ? fetcher.statusCode : undefined;
    const body = asRecord(fetcher?.body);
    const inner = asRecord(body?.content);
    const code = firstString(body?.code, inner?.code, body?.error);
    const message = firstString(body?.suggestedFix, inner?.suggestedFix, body?.message, inner?.message);
    return { statusCode, code, message };
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
    return typeof value === "object" && value != null ? (value as Record<string, unknown>) : undefined;
}

function firstString(...values: unknown[]): string | undefined {
    return values.find((value): value is string => typeof value === "string" && value.length > 0);
}
