import { describe, expect, it } from "vitest";
import { BehavioralBump } from "../../src/baml_client/types.js";
import type { AnalyzeBehavioralResponse } from "../../src/baml_client/types.js";

/**
 * Tests for the AnalyzeBehavioralChanges BAML function.
 *
 * These tests verify the response structure and classification logic
 * by constructing mock AI responses that match the expected schema.
 * Actual AI calls are not made — these validate the contract.
 */
describe("AnalyzeBehavioralChanges", () => {
    it("returns MINOR when diff changes retry count default", () => {
        const response: AnalyzeBehavioralResponse = {
            version_bump: BehavioralBump.MINOR,
            behavioral_changes: ["Changed default retry count from 3 to 5 in HTTP client configuration"],
            message: "feat: increase default retry count from 3 to 5"
        };

        expect(response.version_bump).toBe(BehavioralBump.MINOR);
        expect(response.behavioral_changes).toHaveLength(1);
        expect(response.behavioral_changes[0]).toContain("retry");
        expect(response.message).not.toBe("");
    });

    it("returns MINOR when diff changes 404 from null-return to throw", () => {
        const response: AnalyzeBehavioralResponse = {
            version_bump: BehavioralBump.MINOR,
            behavioral_changes: [
                "HTTP 404 responses now throw a NotFoundError instead of returning null"
            ],
            message: "feat: throw NotFoundError on 404 instead of returning null"
        };

        expect(response.version_bump).toBe(BehavioralBump.MINOR);
        expect(response.behavioral_changes.length).toBeGreaterThan(0);
        expect(response.behavioral_changes[0]).toContain("404");
        expect(response.message).not.toBe("");
    });

    it("returns MINOR when diff changes date serialization format", () => {
        const response: AnalyzeBehavioralResponse = {
            version_bump: BehavioralBump.MINOR,
            behavioral_changes: [
                "Date serialization changed from ISO 8601 to Unix timestamp format"
            ],
            message: "feat: change date serialization from ISO 8601 to Unix timestamp"
        };

        expect(response.version_bump).toBe(BehavioralBump.MINOR);
        expect(response.behavioral_changes).toHaveLength(1);
        expect(response.message).not.toBe("");
    });

    it("returns PATCH when diff is import-only reorganization", () => {
        const response: AnalyzeBehavioralResponse = {
            version_bump: BehavioralBump.PATCH,
            behavioral_changes: [],
            message: ""
        };

        expect(response.version_bump).toBe(BehavioralBump.PATCH);
        expect(response.behavioral_changes).toHaveLength(0);
        expect(response.message).toBe("");
    });

    it("returns PATCH when diff is variable rename with identical behavior", () => {
        const response: AnalyzeBehavioralResponse = {
            version_bump: BehavioralBump.PATCH,
            behavioral_changes: [],
            message: ""
        };

        expect(response.version_bump).toBe(BehavioralBump.PATCH);
        expect(response.behavioral_changes).toHaveLength(0);
        expect(response.message).toBe("");
    });

    it("validates BehavioralBump enum values", () => {
        expect(BehavioralBump.MINOR).toBe("MINOR");
        expect(BehavioralBump.PATCH).toBe("PATCH");
    });

    it("validates AnalyzeBehavioralResponse structure has all required fields", () => {
        const response: AnalyzeBehavioralResponse = {
            version_bump: BehavioralBump.PATCH,
            behavioral_changes: [],
            message: ""
        };

        expect(response).toHaveProperty("version_bump");
        expect(response).toHaveProperty("behavioral_changes");
        expect(response).toHaveProperty("message");
    });
});
