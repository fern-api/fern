import { notificationUrlCandidates } from "../../../src/core/webhooks/notificationUrlCandidates";

describe("notificationUrlCandidates", () => {
    it("always includes the caller URL verbatim", () => {
        const url = "https://example.com/sms?bodySHA256=abc";
        expect(notificationUrlCandidates(url, { portVariants: true, legacyQueryEncoding: true })).toContain(url);
    });

    it("returns only the caller URL for an unparseable input (never throws)", () => {
        expect(notificationUrlCandidates("not a url", { portVariants: true, legacyQueryEncoding: true })).toEqual([
            "not a url"
        ]);
    });

    describe("portVariants", () => {
        it("adds the standard https port (:443) when absent", () => {
            const candidates = notificationUrlCandidates("https://example.com/sms?bodySHA256=abc", {
                portVariants: true,
                legacyQueryEncoding: false
            });
            expect(candidates).toContain("https://example.com/sms?bodySHA256=abc");
            expect(candidates).toContain("https://example.com:443/sms?bodySHA256=abc");
        });

        it("adds the standard http port (:80) when absent", () => {
            const candidates = notificationUrlCandidates("http://example.com/sms", {
                portVariants: true,
                legacyQueryEncoding: false
            });
            expect(candidates).toContain("http://example.com:80/sms");
        });

        it("removes a non-standard port", () => {
            const candidates = notificationUrlCandidates("https://example.com:8443/sms", {
                portVariants: true,
                legacyQueryEncoding: false
            });
            expect(candidates).toContain("https://example.com/sms");
            expect(candidates).toContain("https://example.com:8443/sms");
        });

        it("does not add port variants when disabled", () => {
            const candidates = notificationUrlCandidates("https://example.com/sms", {
                portVariants: false,
                legacyQueryEncoding: false
            });
            expect(candidates).toEqual(["https://example.com/sms"]);
        });
    });

    describe("legacyQueryEncoding", () => {
        it("re-encodes the query with legacy form-encoding (space becomes +)", () => {
            const candidates = notificationUrlCandidates("https://example.com/sms?a=b%20c", {
                portVariants: false,
                legacyQueryEncoding: true
            });
            expect(candidates).toContain("https://example.com/sms?a=b+c");
        });

        it("leaves a query-less URL unchanged", () => {
            const candidates = notificationUrlCandidates("https://example.com/sms", {
                portVariants: false,
                legacyQueryEncoding: true
            });
            expect(candidates).toEqual(["https://example.com/sms"]);
        });
    });

    it("produces the four port × legacy candidates when both are enabled", () => {
        const candidates = notificationUrlCandidates("https://example.com:8443/sms?a=b%20c", {
            portVariants: true,
            legacyQueryEncoding: true
        });
        expect(new Set(candidates)).toEqual(
            new Set([
                "https://example.com:8443/sms?a=b%20c",
                "https://example.com/sms?a=b%20c",
                "https://example.com:8443/sms?a=b+c",
                "https://example.com/sms?a=b+c"
            ])
        );
    });
});
