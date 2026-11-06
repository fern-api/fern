import { describe, expect, it } from "vitest";
import { getGuestSdkBuildUrl } from "../guestSdkBuildLink";

describe("getGuestSdkBuildUrl", () => {
    it("points at the dashboard that issued the session's claim link", () => {
        expect(
            getGuestSdkBuildUrl({
                claimUrl: "https://dashboard.buildwithfern.com/claim/gs_ef86b1f3547a#secret",
                buildId: "bld_01HZX"
            })
        ).toBe("https://dashboard.buildwithfern.com/sdk/bld_01HZX#secret");
    });

    it("follows a beta dashboard and keeps the ID URL-safe", () => {
        expect(
            getGuestSdkBuildUrl({ claimUrl: "https://dashboard-beta.example.dev/claim/gs_1#s", buildId: "a/b" })
        ).toBe("https://dashboard-beta.example.dev/sdk/a%2Fb#s");
    });

    it("has no fragment when the claim link has none", () => {
        expect(getGuestSdkBuildUrl({ claimUrl: "https://d.example.com/claim/gs_1", buildId: "b" })).toBe(
            "https://d.example.com/sdk/b"
        );
    });

    it("is undefined for a claim link that is not a URL, so the log line never fails a build", () => {
        expect(getGuestSdkBuildUrl({ claimUrl: "", buildId: "bld_1" })).toBeUndefined();
        expect(getGuestSdkBuildUrl({ claimUrl: "/claim/gs_1", buildId: "bld_1" })).toBeUndefined();
    });
});
