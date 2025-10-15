import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { type SdkDiffResult, sdkDiffCommand } from "../../commands/sdk-diff/sdkDiffCommand";
import { cleanupFixtures, getFixturePath, SDK_TEST_SCENARIOS, validateFixture } from "./helpers/fixtureHelpers";
import {
    type ExpectedResult,
    generateTestReport,
    type TestReport,
    validateAnalysisResult
} from "./helpers/llmValidation";
import { MockSdkDiffCliContext } from "./helpers/mockContext";

describe("SDK Diff Command Tests", () => {
    let context: MockSdkDiffCliContext;

    beforeAll(async () => {
        context = new MockSdkDiffCliContext();

        // Validate that all fixtures exist and have proper structure
        const baseValid = await validateFixture("base");
        expect(baseValid).toBe(true);

        for (const scenario of Object.keys(SDK_TEST_SCENARIOS)) {
            const valid = await validateFixture(scenario);
            expect(valid).toBe(true);
        }
    });

    afterAll(async () => {
        // Uncomment this to clean up fixtures after tests
        // await cleanupFixtures();
    });

    describe("Basic Diff Generation", () => {
        it("should detect no changes between identical SDKs", async () => {
            const fromDir = getFixturePath("base");
            const toDir = getFixturePath("no-change");

            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            expect(result.versionBump).toBe("no_change");
            expect(result.headline).toContain("No changes");
            expect(result.breakingChanges).toHaveLength(0);
        });

        it("should generate diff for different SDKs", async () => {
            const fromDir = getFixturePath("base");
            const toDir = getFixturePath("new-endpoint");

            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            // Should detect changes
            expect(result.versionBump).not.toBe("no_change");
            expect(result.headline).toBeDefined();
            expect(result.headline.length).toBeGreaterThan(0);
            expect(result.description).toBeDefined();
            expect(result.description.length).toBeGreaterThan(0);
        });
    });

    describe("Version Bump Classification", () => {
        it.each([
            ["addedEndpoint", "minor"],
            ["addedOptionalTypeProperty", "minor"],
            ["addedRequiredTypeProperty", "major"],
            ["addedType", "minor"],
            ["addedHeader", "minor"]
        ])("should classify %s as %s version bump", async (scenarioName, expectedBump) => {
            const fromDir = getFixturePath("base");
            const toDir = getFixturePath(scenarioName);

            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            expect(result.versionBump).toBe(expectedBump);
        });
    });

    describe("Breaking Changes Detection", () => {
        const breakingScenarios = ["addedRequiredTypeProperty"];

        const nonBreakingScenarios = ["addedEndpoint", "addedOptionalTypeProperty", "addedType", "addedHeader"];

        it.each(breakingScenarios)("should detect breaking changes in %s", async (scenarioName) => {
            const fromDir = getFixturePath("base");
            const toDir = getFixturePath(scenarioName);

            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            expect(result.versionBump).toBe("major");
            expect(result.breakingChanges.length).toBeGreaterThan(0);
        });

        it.each(nonBreakingScenarios)("should not detect breaking changes in %s", async (scenarioName) => {
            const fromDir = getFixturePath("base");
            const toDir = getFixturePath(scenarioName);

            const result = await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            expect(result.breakingChanges).toHaveLength(0);
        });
    });

    describe("Commit Message Format", () => {
        it.each(Object.entries(SDK_TEST_SCENARIOS))(
            "should generate proper conventional commit for %s",
            async (scenarioName, scenarioConfig) => {
                const fromDir = getFixturePath("base");
                const toDir = getFixturePath(scenarioName);

                const result = await sdkDiffCommand({
                    context,
                    fromDir,
                    toDir
                });

                // Check conventional commits format: type: description
                const conventionalCommitPattern =
                    /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?: .+/;
                expect(result.headline).toMatch(conventionalCommitPattern);

                // Check length constraints
                expect(result.headline.length).toBeLessThanOrEqual(72);
                expect(result.headline.length).toBeGreaterThanOrEqual(10);

                // Check expected commit type
                expect(result.headline).toMatch(new RegExp(`^${scenarioConfig.expectedCommitType}:`));
            }
        );
    });

    describe("Description Quality", () => {
        it.each(Object.keys(SDK_TEST_SCENARIOS))(
            "should generate meaningful description for %s",
            async (scenarioName) => {
                const fromDir = getFixturePath("base");
                const toDir = getFixturePath(scenarioName);

                const result = await sdkDiffCommand({
                    context,
                    fromDir,
                    toDir
                });

                // Basic quality checks
                expect(result.description).toBeDefined();
                expect(result.description.trim().length).toBeGreaterThan(20);

                // Should not just be the headline repeated
                expect(result.description.toLowerCase()).not.toBe(result.headline.toLowerCase());

                // Should contain meaningful content (not just whitespace)
                const meaningfulContent = result.description.replace(/[\s\n\r\t*#-]/g, "");
                expect(meaningfulContent.length).toBeGreaterThan(10);
            }
        );
    });

    describe("Error Handling", () => {
        it("should handle non-existent from directory", async () => {
            await expect(
                sdkDiffCommand({
                    context,
                    fromDir: "/non/existent/path",
                    toDir: getFixturePath("base")
                })
            ).rejects.toThrow();

            expect(context.capturedErrors.length).toBeGreaterThan(0);
            expect(context.capturedErrors[0]).toContain("Directory not found");
        });

        it("should handle non-existent to directory", async () => {
            await expect(
                sdkDiffCommand({
                    context,
                    fromDir: getFixturePath("base"),
                    toDir: "/non/existent/path"
                })
            ).rejects.toThrow();

            expect(context.capturedErrors.length).toBeGreaterThan(0);
        });
    });

    describe("Comprehensive Validation", () => {
        it("should generate comprehensive test reports for all scenarios", async () => {
            const reports: TestReport[] = [];

            for (const [scenarioName, scenarioConfig] of Object.entries(SDK_TEST_SCENARIOS)) {
                const fromDir = getFixturePath("base");
                const toDir = getFixturePath(scenarioName);

                const analysis = await sdkDiffCommand({
                    context,
                    fromDir,
                    toDir
                });

                const expectedResult: ExpectedResult = {
                    versionBump: scenarioConfig.expectedVersionBump,
                    commitType: scenarioConfig.expectedCommitType,
                    hasBreakingChanges: scenarioConfig.expectedBreakingChanges.length > 0,
                    scenarioDescription: scenarioConfig.description
                };

                const report = await generateTestReport(scenarioName, analysis, expectedResult);
                reports.push(report);

                // Individual scenario validation
                expect(report.passed).toBe(
                    true,
                    `Scenario '${scenarioName}' failed validation: ${report.validation.issues.join(", ")}`
                );
            }

            // Overall validation
            const failedReports = reports.filter((r) => !r.passed);
            if (failedReports.length > 0) {
                console.error(
                    "Failed scenarios:",
                    failedReports.map((r) => ({
                        scenario: r.scenario,
                        issues: r.validation.issues
                    }))
                );
            }

            expect(failedReports).toHaveLength(0);
        });
    });

    describe("Performance", () => {
        it("should complete analysis within reasonable time", async () => {
            const fromDir = getFixturePath("base");
            const toDir = getFixturePath("new-endpoint");

            const startTime = Date.now();

            await sdkDiffCommand({
                context,
                fromDir,
                toDir
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete within 30 seconds (LLM calls can be slow)
            expect(duration).toBeLessThan(30000);
        });
    });
});
