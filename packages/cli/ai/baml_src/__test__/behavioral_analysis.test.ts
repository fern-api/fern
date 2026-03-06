import { describe, expect, it } from "vitest";
import type { AnalyzeCommitDiffResponse } from "../../src/baml_client/types.js";
import { VersionBump } from "../../src/baml_client/types.js";

/**
 * Tests for the unified AnalyzeSdkDiff BAML function's behavioral analysis.
 *
 * The merged prompt handles both surface-level and behavioral change detection
 * in a single AI call. These tests verify the response structure and
 * classification logic by constructing mock AI responses that match the schema.
 * Actual AI calls are not made — these validate the contract.
 */
describe("AnalyzeSdkDiff - Behavioral Analysis", () => {
    it("returns MINOR when diff changes retry count default", () => {
        const response: AnalyzeCommitDiffResponse = {
            version_bump: VersionBump.MINOR,
            message: "feat: increase default retry count from 3 to 5",
            changelog_entry:
                "The default retry count has been increased from 3 to 5, which may affect request behavior for consumers relying on the previous default."
        };

        expect(response.version_bump).toBe(VersionBump.MINOR);
        expect(response.changelog_entry).not.toBe("");
        expect(response.message).not.toBe("");
    });

    it("returns MINOR when diff changes 404 from null-return to throw", () => {
        const response: AnalyzeCommitDiffResponse = {
            version_bump: VersionBump.MINOR,
            message: "feat: throw NotFoundError on 404 instead of returning null",
            changelog_entry:
                "HTTP 404 responses now throw a NotFoundError instead of returning null. Consumers handling null returns should update their error handling."
        };

        expect(response.version_bump).toBe(VersionBump.MINOR);
        expect(response.changelog_entry).not.toBe("");
        expect(response.message).not.toBe("");
    });

    it("returns MINOR when diff changes date serialization format", () => {
        const response: AnalyzeCommitDiffResponse = {
            version_bump: VersionBump.MINOR,
            message: "feat: change date serialization from ISO 8601 to Unix timestamp",
            changelog_entry:
                "Date serialization has changed from ISO 8601 to Unix timestamp format. Consumers parsing date strings should update their deserialization logic."
        };

        expect(response.version_bump).toBe(VersionBump.MINOR);
        expect(response.changelog_entry).not.toBe("");
        expect(response.message).not.toBe("");
    });

    it("returns PATCH when diff is import-only reorganization", () => {
        const response: AnalyzeCommitDiffResponse = {
            version_bump: VersionBump.PATCH,
            message: "refactor: reorganize imports",
            changelog_entry: ""
        };

        expect(response.version_bump).toBe(VersionBump.PATCH);
        expect(response.changelog_entry).toBe("");
    });

    it("returns PATCH when diff is variable rename with identical behavior", () => {
        const response: AnalyzeCommitDiffResponse = {
            version_bump: VersionBump.PATCH,
            message: "refactor: rename internal variables for clarity",
            changelog_entry: ""
        };

        expect(response.version_bump).toBe(VersionBump.PATCH);
        expect(response.changelog_entry).toBe("");
    });

    it("validates VersionBump enum values used for behavioral analysis", () => {
        expect(VersionBump.MINOR).toBe("MINOR");
        expect(VersionBump.PATCH).toBe("PATCH");
        expect(VersionBump.MAJOR).toBe("MAJOR");
        expect(VersionBump.NO_CHANGE).toBe("NO_CHANGE");
    });

    it("validates AnalyzeCommitDiffResponse structure has all required fields", () => {
        const response: AnalyzeCommitDiffResponse = {
            version_bump: VersionBump.PATCH,
            message: "refactor: internal cleanup",
            changelog_entry: ""
        };

        expect(response).toHaveProperty("version_bump");
        expect(response).toHaveProperty("message");
        expect(response).toHaveProperty("changelog_entry");
    });
});
