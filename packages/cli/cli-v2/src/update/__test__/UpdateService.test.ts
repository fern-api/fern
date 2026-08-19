import { describe, expect, it } from "vitest";
import { compareVersionsDesc, isUpgradeAvailable, stripTagPrefix } from "../UpdateService.js";

describe("stripTagPrefix", () => {
    it("strips a leading v from semver tags", () => {
        expect(stripTagPrefix("v1.2.3")).toBe("1.2.3");
    });

    it("leaves un-prefixed tags untouched", () => {
        expect(stripTagPrefix("1.2.3")).toBe("1.2.3");
    });

    it("does not strip a v that is not in the leading position", () => {
        expect(stripTagPrefix("1.v2.3")).toBe("1.v2.3");
    });
});

describe("compareVersionsDesc", () => {
    it("orders semver versions in descending order", () => {
        const versions = ["1.0.0", "2.0.0", "1.5.3", "0.9.9"];
        versions.sort(compareVersionsDesc);
        expect(versions).toEqual(["2.0.0", "1.5.3", "1.0.0", "0.9.9"]);
    });

    it("handles equal versions", () => {
        expect(compareVersionsDesc("1.2.3", "1.2.3")).toBe(0);
    });

    it("falls back to lexicographic comparison for non-semver strings", () => {
        // "alpha" > "beta" lexicographically (in reverse order)
        const versions = ["alpha", "beta"];
        versions.sort(compareVersionsDesc);
        expect(versions).toEqual(["beta", "alpha"]);
    });

    it("pads shorter version strings with zeros", () => {
        expect(compareVersionsDesc("1.0", "1.0.0")).toBe(0);
        expect(compareVersionsDesc("1.0", "1.0.1")).toBeGreaterThan(0);
    });
});

describe("isUpgradeAvailable", () => {
    it("treats * as always upgradeable", () => {
        expect(isUpgradeAvailable("*", "1.0.0")).toBe(true);
    });

    it("treats 0.0.0 as always upgradeable", () => {
        expect(isUpgradeAvailable("0.0.0", "1.0.0")).toBe(true);
    });

    it("treats empty string as always upgradeable", () => {
        expect(isUpgradeAvailable("", "1.0.0")).toBe(true);
    });

    it("returns true when latest is newer than current", () => {
        expect(isUpgradeAvailable("1.2.3", "1.2.4")).toBe(true);
        expect(isUpgradeAvailable("1.2.3", "1.3.0")).toBe(true);
        expect(isUpgradeAvailable("1.2.3", "2.0.0")).toBe(true);
    });

    it("returns false when latest is the same as current", () => {
        expect(isUpgradeAvailable("1.2.3", "1.2.3")).toBe(false);
    });

    it("returns false when latest is older than current", () => {
        expect(isUpgradeAvailable("2.0.0", "1.9.9")).toBe(false);
    });

    it("returns false for identical non-semver inputs", () => {
        expect(isUpgradeAvailable("not-a-version", "not-a-version")).toBe(false);
    });

    it("falls back to string inequality for non-semver inputs", () => {
        expect(isUpgradeAvailable("not-a-version", "still-not-a-version")).toBe(true);
    });
});
