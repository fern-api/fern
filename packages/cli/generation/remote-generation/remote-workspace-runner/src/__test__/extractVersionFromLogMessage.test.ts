import { describe, expect, it } from "vitest";

import { extractVersionFromLogMessage } from "../RemoteTaskHandler.js";

describe("extractVersionFromLogMessage", () => {
    it("extracts a plain semver from 'Tagging release X.Y.Z'", () => {
        expect(extractVersionFromLogMessage("Tagging release 0.0.9")).toBe("0.0.9");
    });

    it("extracts a multi-digit version", () => {
        expect(extractVersionFromLogMessage("Tagging release 12.34.56")).toBe("12.34.56");
    });

    it("strips the v prefix from Go-style versions", () => {
        expect(extractVersionFromLogMessage("Tagging release v0.2.0")).toBe("0.2.0");
    });

    it("captures pre-release suffixes", () => {
        expect(extractVersionFromLogMessage("Tagging release 1.0.0-rc.1")).toBe("1.0.0-rc.1");
    });

    it("captures v-prefixed pre-release versions and strips the v", () => {
        expect(extractVersionFromLogMessage("Tagging release v2.0.0-beta.3")).toBe("2.0.0-beta.3");
    });

    it("handles alpha pre-release tags", () => {
        expect(extractVersionFromLogMessage("Tagging release 0.1.0-alpha")).toBe("0.1.0-alpha");
    });

    it("captures hyphen-separated pre-release identifiers", () => {
        expect(extractVersionFromLogMessage("Tagging release 1.0.0-rc-1")).toBe("1.0.0-rc-1");
    });

    it("captures complex pre-release with mixed separators", () => {
        expect(extractVersionFromLogMessage("Tagging release 1.0.0-pre-release.2")).toBe("1.0.0-pre-release.2");
    });

    it("extracts the version when the message has surrounding text", () => {
        expect(extractVersionFromLogMessage("[INFO] Tagging release 3.1.4 on main branch")).toBe("3.1.4");
    });

    it("returns undefined for messages without a tagging release pattern", () => {
        expect(extractVersionFromLogMessage("Published @acme/sdk@0.1.0")).toBeUndefined();
    });

    it("returns undefined for an empty message", () => {
        expect(extractVersionFromLogMessage("")).toBeUndefined();
    });

    it("returns undefined for a partial match without a version", () => {
        expect(extractVersionFromLogMessage("Tagging release notes")).toBeUndefined();
    });
});
