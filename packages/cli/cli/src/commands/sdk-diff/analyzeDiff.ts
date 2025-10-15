/**
 * SDK Diff Analysis Utility
 *
 * This module provides LLM-based analysis of SDK diffs using BAML.
 * It takes a git diff and produces a semantic commit message and version bump recommendation.
 */

import { b } from "../../../baml_client";
import type { DiffAnalysisResult, VersionBump } from "../../../baml_client/types";

export interface SdkDiffAnalysis {
    /**
     * Semantic commit message headline (e.g., "feat: Add new authentication methods")
     */
    headline: string;

    /**
     * Detailed markdown-formatted description of the changes
     */
    description: string;

    /**
     * Recommended version bump (major/minor/patch/no_change)
     */
    versionBump: "major" | "minor" | "patch" | "no_change";

    /**
     * List of breaking changes (if any)
     */
    breakingChanges: string[];
}

/**
 * Analyzes a git diff of SDK code using LLM and produces:
 * 1. A semantic commit message with headline and description
 * 2. A version bump recommendation (major/minor/patch)
 *
 * @param gitDiff - The git diff output to analyze
 * @returns Promise<SdkDiffAnalysis> - The analysis result
 * @throws Error if the LLM analysis fails
 *
 * @example
 * ```typescript
 * const diff = await fs.readFile('sdk.diff', 'utf-8');
 * const analysis = await analyzeSdkDiff(diff);
 * console.log(analysis.headline); // "feat: Add new authentication methods"
 * console.log(analysis.versionBump); // "minor"
 * ```
 */
export async function analyzeSdkDiff(gitDiff: string): Promise<SdkDiffAnalysis> {
    try {
        // Call the BAML-generated function
        const result: DiffAnalysisResult = await b.AnalyzeSdkDiff(gitDiff);

        // Convert the BAML result to our interface
        return {
            headline: result.headline,
            description: result.description,
            versionBump: mapVersionBump(result.version_bump),
            breakingChanges: result.breaking_changes
        };
    } catch (error) {
        throw new Error(`Failed to analyze SDK diff: ${error instanceof Error ? error.message : String(error)}`);
    }
}

/**
 * Maps BAML VersionBump enum to lowercase version bump string
 */
function mapVersionBump(bump: VersionBump): "major" | "minor" | "patch" | "no_change" {
    switch (bump) {
        case "MAJOR":
            return "major";
        case "MINOR":
            return "minor";
        case "PATCH":
            return "patch";
        case "NO_CHANGE":
            return "no_change";
        default:
            throw new Error(`Unknown version bump: ${bump}`);
    }
}
