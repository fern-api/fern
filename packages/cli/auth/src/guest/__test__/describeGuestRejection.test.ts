import { describe, expect, it } from "vitest";

import { describeGuestRejection, isGuestRejection, readGuestRejection } from "../describeGuestRejection.js";

describe("describeGuestRejection", () => {
    it("suggests --new-session only when the session itself has ended", () => {
        for (const code of ["GUEST_SESSION_EXPIRED", "GUEST_SESSION_TAKEN_DOWN", "GUEST_SESSION_NOT_FOUND"]) {
            const message = describeGuestRejection({ statusCode: 410, code, message: undefined });
            expect(message).toContain("--new-session");
            expect(message).toContain(code);
        }
    });

    it("points a claimed session at fern login, not at a new session", () => {
        const message = describeGuestRejection({
            statusCode: 409,
            code: "GUEST_SESSION_CLAIMED",
            message: "This guest session has been claimed."
        });
        expect(message).toContain("fern login");
        expect(message).toContain("This guest session has been claimed.");
        expect(message).not.toContain("--new-session");
    });

    it("keeps the session when a limit is used up", () => {
        const message = describeGuestRejection({ statusCode: 429, code: "GUEST_LIMIT_REACHED", message: undefined });
        expect(message).toContain("limit");
        expect(message).toContain("still there");
        expect(message).not.toContain("--new-session");
    });

    it("is neutral about a plain 403 and does not push the user to a new session", () => {
        const message = describeGuestRejection({ statusCode: 403, code: undefined, message: "Forbidden" });
        expect(message).toContain("HTTP 403");
        expect(message).toContain("fern whoami");
        expect(message).toContain("fern claim");
        expect(message).not.toContain("--new-session");
    });
});

describe("readGuestRejection", () => {
    it("reads a Venus problem body from the fetcher error", () => {
        expect(
            readGuestRejection({
                reason: "status-code",
                statusCode: 410,
                body: { code: "GUEST_SESSION_EXPIRED", retryable: false, suggestedFix: "Start a new one." }
            })
        ).toEqual({ statusCode: 410, code: "GUEST_SESSION_EXPIRED", message: "Start a new one." });
    });

    it("reads a Fiddle/FDR envelope from the SDK wrapper", () => {
        expect(
            readGuestRejection({
                content: {
                    reason: "status-code",
                    statusCode: 403,
                    body: { error: "ForbiddenError", content: { message: "User does not belong to organization" } }
                }
            })
        ).toEqual({ statusCode: 403, code: "ForbiddenError", message: "User does not belong to organization" });
    });

    it("is empty for anything else", () => {
        expect(readGuestRejection(new Error("boom"))).toEqual({
            statusCode: undefined,
            code: undefined,
            message: undefined
        });
        expect(isGuestRejection(readGuestRejection(new Error("boom")))).toBe(false);
        expect(isGuestRejection({ statusCode: 500, code: "GUEST_SESSION_CHECK_FAILED", message: undefined })).toBe(
            true
        );
        expect(isGuestRejection({ statusCode: 403, code: undefined, message: undefined })).toBe(true);
    });
});
