import { describe, expect, it } from "vitest";
import { getGuestSdkBuildUrl } from "../guestSdkBuildLink";

describe("getGuestSdkBuildUrl", () => {
    it("points at the dashboard that issued the session's claim link", () => {
        expect(
            getGuestSdkBuildUrl({
                claimUrl: "https://dashboard.buildwithfern.com/claim/gs_ef86b1f3547a#secret",
                buildId: "bld_01HZX"
            })
        ).toBe("https://dashboard.buildwithfern.com/sdk/bld_01HZX");
    });

    it("follows a beta dashboard and keeps the ID URL-safe", () => {
        expect(
            getGuestSdkBuildUrl({ claimUrl: "https://dashboard-beta.example.dev/claim/gs_1#s", buildId: "a/b" })
        ).toBe("https://dashboard-beta.example.dev/sdk/a%2Fb");
    });
});
