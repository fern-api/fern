import { describe, expect, it } from "vitest";

import { getPublishType } from "../utils/publishRouting.js";

describe("getPublishType", () => {
    it("routes plain GA version to ga", () => {
        expect(getPublishType({ version: "5.9.0", isDevRelease: undefined })).toBe("ga");
        expect(getPublishType({ version: "5.9.0", isDevRelease: false })).toBe("ga");
        expect(getPublishType({ version: "1.0.0", isDevRelease: undefined })).toBe("ga");
        expect(getPublishType({ version: "0.1.0", isDevRelease: undefined })).toBe("ga");
    });

    it("routes rc prerelease to prerelease", () => {
        expect(getPublishType({ version: "5.9.0-rc.0", isDevRelease: undefined })).toBe("prerelease");
        expect(getPublishType({ version: "5.9.0-rc.1", isDevRelease: false })).toBe("prerelease");
        expect(getPublishType({ version: "1.0.0-rc.42", isDevRelease: undefined })).toBe("prerelease");
    });

    it("routes alpha prerelease to prerelease", () => {
        expect(getPublishType({ version: "5.9.0-alpha.0", isDevRelease: undefined })).toBe("prerelease");
        expect(getPublishType({ version: "5.9.0-alpha.3", isDevRelease: false })).toBe("prerelease");
    });

    it("routes beta prerelease to prerelease", () => {
        expect(getPublishType({ version: "5.9.0-beta.0", isDevRelease: undefined })).toBe("prerelease");
        expect(getPublishType({ version: "5.9.0-beta.3", isDevRelease: false })).toBe("prerelease");
    });

    it("routes named prereleases to prerelease", () => {
        expect(getPublishType({ version: "5.9.0-next.42", isDevRelease: undefined })).toBe("prerelease");
        expect(getPublishType({ version: "5.9.0-next.20240501", isDevRelease: undefined })).toBe("prerelease");
        expect(getPublishType({ version: "2.0.0-canary.1", isDevRelease: undefined })).toBe("prerelease");
        expect(getPublishType({ version: "1.0.0-preview.5", isDevRelease: undefined })).toBe("prerelease");
    });

    it("routes dev release to dev regardless of version", () => {
        expect(getPublishType({ version: "5.9.0", isDevRelease: true })).toBe("dev");
        expect(getPublishType({ version: "5.9.0-rc.0", isDevRelease: true })).toBe("dev");
        expect(getPublishType({ version: "5.9.0-alpha.0", isDevRelease: true })).toBe("dev");
        expect(getPublishType({ version: "1.0.0-beta.3", isDevRelease: true })).toBe("dev");
    });

    it("returns ga for malformed versions that semver cannot parse", () => {
        expect(getPublishType({ version: "not-a-version", isDevRelease: undefined })).toBe("ga");
        expect(getPublishType({ version: "1.2", isDevRelease: undefined })).toBe("ga");
    });
});
