import { b } from "../../../baml_client";
import type { SdkDiffAnalysis } from "../../../commands/sdk-diff/analyzeDiff";

/**
 * Helper for validating SDK diff analysis results using LLM evaluation
 */
export interface ValidationResult {
    isValid: boolean;
    score: number; // 0-100
    feedback: string;
    issues: string[];
}

/**
 * Expected test result for a specific SDK diff scenario
 */
export interface ExpectedResult {
    versionBump: "major" | "minor" | "patch" | "no_change";
    commitType: string;
    hasBreakingChanges: boolean;
    scenarioDescription: string;
}

/**
 * Validate that the analysis result matches expected outcomes for a test case
 */
export function validateAnalysisResult(analysis: SdkDiffAnalysis, expected: ExpectedResult): ValidationResult {
    const issues: string[] = [];
    let score = 100;

    // Validate version bump
    if (analysis.versionBump !== expected.versionBump) {
        issues.push(`Version bump mismatch: expected '${expected.versionBump}', got '${analysis.versionBump}'`);
        score -= 30;
    }

    // Validate commit type
    const commitTypePattern = new RegExp(`^${expected.commitType}:`);
    if (!commitTypePattern.test(analysis.headline)) {
        issues.push(`Commit type mismatch: expected '${expected.commitType}:', got '${analysis.headline}'`);
        score -= 20;
    }

    // Validate breaking changes
    const hasBreakingChanges = analysis.breakingChanges.length > 0;
    if (hasBreakingChanges !== expected.hasBreakingChanges) {
        issues.push(`Breaking changes mismatch: expected ${expected.hasBreakingChanges}, got ${hasBreakingChanges}`);
        score -= 25;
    }

    // Validate headline format (conventional commits)
    if (!isValidConventionalCommit(analysis.headline)) {
        issues.push(`Invalid conventional commit format: '${analysis.headline}'`);
        score -= 15;
    }

    // Validate description is meaningful
    if (!analysis.description || analysis.description.trim().length < 10) {
        issues.push("Description is too short or empty");
        score -= 10;
    }

    const isValid = issues.length === 0;
    const feedback = isValid
        ? "Analysis result matches all expected criteria"
        : `Found ${issues.length} validation issues`;

    return {
        isValid,
        score: Math.max(0, score),
        feedback,
        issues
    };
}

/**
 * Use BAML LLM to qualitatively evaluate description quality
 */
export async function evaluateDescriptionQuality(
    description: string,
    scenario: string
): Promise<{ score: number; feedback: string }> {
    try {
        // This would use a custom BAML function to evaluate description quality
        // For now, we'll implement a basic evaluation
        const score = evaluateDescriptionBasic(description, scenario);
        const feedback = score > 70 ? "Description quality is good" : "Description could be more detailed or specific";

        return { score, feedback };
    } catch (error) {
        return {
            score: 0,
            feedback: `Failed to evaluate description quality: ${error}`
        };
    }
}

/**
 * Basic description quality evaluation
 */
function evaluateDescriptionBasic(description: string, scenario: string): number {
    let score = 0;

    // Check length
    if (description.length > 50) score += 20;
    if (description.length > 100) score += 10;

    // Check for markdown formatting
    if (description.includes("*") || description.includes("#") || description.includes("-")) {
        score += 10;
    }

    // Check for scenario-specific keywords
    const scenarioKeywords = {
        "new-endpoint": ["new", "endpoint", "method", "function"],
        "removed-endpoint": ["removed", "deleted", "endpoint", "breaking"],
        "new-optional-parameter": ["optional", "parameter", "backward compatible"],
        "new-required-parameter": ["required", "parameter", "breaking"],
        "internal-refactor": ["refactor", "internal", "implementation"],
        "documentation-update": ["documentation", "comments", "docs"]
    };

    const keywords = scenarioKeywords[scenario as keyof typeof scenarioKeywords] || [];
    const lowerDescription = description.toLowerCase();
    const foundKeywords = keywords.filter((keyword) => lowerDescription.includes(keyword));
    score += (foundKeywords.length / keywords.length) * 30;

    // Check for semantic meaning indicators
    if (lowerDescription.includes("user") || lowerDescription.includes("client")) {
        score += 10;
    }

    // Check for action words
    const actionWords = ["add", "remove", "change", "update", "fix", "improve"];
    const hasActionWord = actionWords.some((word) => lowerDescription.includes(word));
    if (hasActionWord) score += 20;

    return Math.min(100, score);
}

/**
 * Validate conventional commit format
 */
function isValidConventionalCommit(headline: string): boolean {
    // Basic pattern: type(scope?): description
    const pattern = /^(build|chore|ci|docs|feat|fix|perf|refactor|revert|style|test)(\(.+\))?: .+/;

    return pattern.test(headline) && headline.length <= 72 && headline.length >= 10;
}

/**
 * Create a comprehensive test report for SDK diff analysis
 */
export interface TestReport {
    scenario: string;
    passed: boolean;
    analysis: SdkDiffAnalysis;
    validation: ValidationResult;
    qualityEvaluation?: { score: number; feedback: string };
}

/**
 * Generate a comprehensive test report
 */
export async function generateTestReport(
    scenario: string,
    analysis: SdkDiffAnalysis,
    expected: ExpectedResult
): Promise<TestReport> {
    const validation = validateAnalysisResult(analysis, expected);

    let qualityEvaluation: { score: number; feedback: string } | undefined;
    try {
        qualityEvaluation = await evaluateDescriptionQuality(analysis.description, scenario);
    } catch (error) {
        // Quality evaluation is optional
    }

    return {
        scenario,
        passed: validation.isValid,
        analysis,
        validation,
        qualityEvaluation
    };
}
