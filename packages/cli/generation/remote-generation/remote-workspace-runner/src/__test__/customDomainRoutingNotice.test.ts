import { describe, expect, it } from "vitest";

import {
    findCustomDomainBlockedMessage,
    formatCustomDomainRoutingNotice,
    isCustomDomainRoutingWarning
} from "../customDomainRoutingNotice.js";

const BLOCKED = [
    "Publishing is blocked: your custom domain is not routed through Fern.",
    "",
    "  docs.acme.com  ->  cname.vercel-dns.com",
    "",
    "Docs cannot be published to a custom domain that is not routed through Fern."
].join("\n");

// The rejection fdr@1.2.174's Vercel-only check sends.
const LEGACY_BLOCKED =
    "Publishing is blocked: your custom domain still points to Vercel.\n\n  docs.acme.com  →  cname.vercel-dns.com";

function stripAnsi(value: string): string {
    // biome-ignore lint/suspicious/noControlCharactersInRegex: matching ANSI escape codes
    return value.replace(/\u001b\[[0-9;]*m/g, "");
}

describe("findCustomDomainBlockedMessage", () => {
    it("finds the message on an oRPC error", () => {
        const error = Object.assign(new Error(BLOCKED), { code: "BAD_REQUEST", status: 400 });
        expect(findCustomDomainBlockedMessage(error)).toBe(BLOCKED);
    });

    it("finds the message in a Fern SDK error body, parsed or raw", () => {
        expect(
            findCustomDomainBlockedMessage({
                error: undefined,
                content: { reason: "status-code", statusCode: 400, body: { code: "BAD_REQUEST", message: BLOCKED } }
            })
        ).toBe(BLOCKED);
        expect(
            findCustomDomainBlockedMessage({
                content: { reason: "status-code", statusCode: 400, body: JSON.stringify({ message: LEGACY_BLOCKED }) }
            })
        ).toBe(LEGACY_BLOCKED);
        expect(findCustomDomainBlockedMessage({ content: { body: JSON.stringify([{ message: BLOCKED }]) } })).toBe(
            BLOCKED
        );
    });

    it("finds the message on a wrapped cause", () => {
        expect(findCustomDomainBlockedMessage(new Error("register failed", { cause: new Error(BLOCKED) }))).toBe(
            BLOCKED
        );
    });

    it("ignores other errors", () => {
        expect(findCustomDomainBlockedMessage(new Error("Publishing is blocked: quota exceeded"))).toBeUndefined();
        expect(findCustomDomainBlockedMessage({ content: { body: "{not json" } })).toBeUndefined();
        expect(findCustomDomainBlockedMessage(undefined)).toBeUndefined();
        const cyclic: Record<string, unknown> = {};
        cyclic.self = cyclic;
        expect(findCustomDomainBlockedMessage(cyclic)).toBeUndefined();
    });
});

describe("isCustomDomainRoutingWarning", () => {
    it("matches FDR's routing warnings", () => {
        expect(
            isCustomDomainRoutingWarning(
                "Action required by December 1, 2026: your custom domain is not routed through Fern."
            )
        ).toBe(true);
        expect(isCustomDomainRoutingWarning("Action required: your custom domains are not routed through Fern.")).toBe(
            true
        );
        expect(
            isCustomDomainRoutingWarning(
                "Published under a temporary bypass that expires 2026-12-10T00:00:00.000Z: your custom domain is not routed through Fern."
            )
        ).toBe(true);
    });

    it("leaves other warnings alone", () => {
        expect(isCustomDomainRoutingWarning("Action required: rotate your API key.")).toBe(false);
    });
});

describe("formatCustomDomainRoutingNotice", () => {
    it("draws the message inside a border as wide as its longest line", () => {
        const lines = stripAnsi(formatCustomDomainRoutingNotice(BLOCKED, "blocked")).split("\n");
        const border = "━".repeat(Math.max(...BLOCKED.split("\n").map((line) => line.length)) + 2);
        expect(lines).toEqual([
            "",
            border,
            " Publishing is blocked: your custom domain is not routed through Fern.",
            "",
            "   docs.acme.com  ->  cname.vercel-dns.com",
            "",
            " Docs cannot be published to a custom domain that is not routed through Fern.",
            border,
            ""
        ]);
    });
});
