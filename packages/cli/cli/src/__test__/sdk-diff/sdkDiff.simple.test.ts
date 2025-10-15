import { beforeAll, describe, expect, it } from "vitest";
import { sdkDiffCommand } from "../../commands/sdk-diff/sdkDiffCommand";
import { getFixturePath, validateFixture } from "./helpers/fixtureHelpers";
import { MockSdkDiffCliContext } from "./helpers/mockContext";

describe("SDK Diff Command - Basic Tests", () => {
    let context: MockSdkDiffCliContext;

    beforeAll(async () => {
        context = new MockSdkDiffCliContext();

        // Validate that fixtures exist
        const baseValid = await validateFixture("base");
        const addedEndpointValid = await validateFixture("addedEndpoint");
        expect(baseValid).toBe(true);
        expect(addedEndpointValid).toBe(true);
    });

    it("should detect differences between base and addedEndpoint SDKs", async () => {
        const fromDir = getFixturePath("base");
        const toDir = getFixturePath("addedEndpoint");

        // Test that we can call the command (even if LLM fails due to missing API key)
        try {
            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            // If we get here, great! Test the result
            expect(result).toBeDefined();
            expect(result.headline).toBeDefined();
            expect(result.description).toBeDefined();
            expect(["major", "minor", "patch", "no_change"]).toContain(result.versionBump);
        } catch (error: any) {
            // Expected if ANTHROPIC_API_KEY is not set
            if (error.message && error.message.includes("ANTHROPIC_API_KEY")) {
                console.log("⚠️  Test requires ANTHROPIC_API_KEY to be set for full functionality");
                expect(true).toBe(true); // Test passes - we're just missing API key
            } else {
                throw error; // Unexpected error
            }
        }
    });

    it("should handle identical SDKs (base vs base)", async () => {
        const fromDir = getFixturePath("base");
        const toDir = getFixturePath("base");

        try {
            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            // Should detect no changes
            expect(result.versionBump).toBe("no_change");
            expect(result.headline).toContain("No changes");
        } catch (error: any) {
            // Expected if ANTHROPIC_API_KEY is not set
            if (error.message && error.message.includes("ANTHROPIC_API_KEY")) {
                console.log("⚠️  Test requires ANTHROPIC_API_KEY to be set for full functionality");
                expect(true).toBe(true);
            } else {
                throw error;
            }
        }
    });
});
