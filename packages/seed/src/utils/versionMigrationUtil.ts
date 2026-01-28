import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import chalk from "chalk";
import { readFile, writeFile } from "fs/promises";
import yaml from "js-yaml";
import {
    computeVersionFromChangelog,
    determineVersionBump,
    type MinimalVersionEntry
} from "./automaticVersionComputation";

/**
 * Analysis result for a version entry showing if it can be automatically computed
 */
export interface VersionAnalysis {
    version: string;
    hasExplicitVersion: boolean;
    computedVersion: string;
    isComputedCorrect: boolean;
    versionBump: string;
    changelogTypes: string[];
}

/**
 * Overall migration analysis for a versions.yml file
 */
export interface MigrationAnalysis {
    totalEntries: number;
    entriesWithExplicitVersions: number;
    entriesWithCorrectComputation: number;
    entriesWithIncorrectComputation: number;
    canRemoveAllVersions: boolean;
    analyses: VersionAnalysis[];
    recommendations: string[];
}

/**
 * Analyzes a versions.yml file to determine if versions can be computed automatically
 */
export async function analyzeVersionsForMigration({
    absolutePathToVersions,
    context
}: {
    absolutePathToVersions: AbsoluteFilePath;
    context: TaskContext;
}): Promise<MigrationAnalysis> {
    const fileContent = await readFile(absolutePathToVersions, "utf-8");
    const parsedYaml = yaml.load(fileContent) as MinimalVersionEntry[];

    const analyses: VersionAnalysis[] = [];
    let entriesWithExplicitVersions = 0;
    let entriesWithCorrectComputation = 0;
    let entriesWithIncorrectComputation = 0;

    // Analyze each entry
    for (let i = 0; i < parsedYaml.length; i++) {
        const entry = parsedYaml[i];
        if (!entry) continue;

        const hasExplicitVersion = !!(entry.version && entry.version.trim() !== "");
        if (hasExplicitVersion) {
            entriesWithExplicitVersions++;
        }

        // Determine what the computed version would be
        let computedVersion: string;
        if (i === parsedYaml.length - 1) {
            // Last entry (oldest), use as base
            computedVersion = entry.version || "1.0.0";
        } else {
            const previousEntry = parsedYaml[i + 1];
            const previousVersion = previousEntry?.version || "1.0.0";
            computedVersion = computeVersionFromChangelog(
                { ...entry, version: undefined }, // Remove explicit version for computation
                previousVersion
            );
        }

        const isComputedCorrect = entry.version === computedVersion;
        const versionBump = determineVersionBump(entry.changelogEntry || []);
        const changelogTypes = (entry.changelogEntry || []).map((ce) => ce.type);

        if (hasExplicitVersion) {
            if (isComputedCorrect) {
                entriesWithCorrectComputation++;
            } else {
                entriesWithIncorrectComputation++;
            }
        }

        analyses.push({
            version: entry.version || "MISSING",
            hasExplicitVersion,
            computedVersion,
            isComputedCorrect,
            versionBump,
            changelogTypes
        });
    }

    // Generate recommendations
    const recommendations: string[] = [];
    const canRemoveAllVersions = entriesWithIncorrectComputation === 0;

    if (canRemoveAllVersions) {
        recommendations.push(
            "✅ All explicit versions match computed versions. You can safely remove all version fields."
        );
        recommendations.push("This will eliminate merge conflicts when multiple PRs are in flight.");
    } else {
        recommendations.push(
            `⚠️  ${entriesWithIncorrectComputation} entries have explicit versions that don't match computed versions.`
        );
        recommendations.push("Review these entries to ensure the changelog types correctly represent the changes.");

        for (const analysis of analyses) {
            if (analysis.hasExplicitVersion && !analysis.isComputedCorrect) {
                recommendations.push(
                    `  - Version ${analysis.version}: computed as ${analysis.computedVersion} based on changelog types [${analysis.changelogTypes.join(", ")}]`
                );
            }
        }
    }

    if (entriesWithExplicitVersions > 0) {
        recommendations.push(
            `📊 ${entriesWithCorrectComputation}/${entriesWithExplicitVersions} explicit versions match automatic computation.`
        );
    }

    return {
        totalEntries: parsedYaml.length,
        entriesWithExplicitVersions,
        entriesWithCorrectComputation,
        entriesWithIncorrectComputation,
        canRemoveAllVersions,
        analyses,
        recommendations
    };
}

/**
 * Creates a migrated version of the versions.yml file with version fields removed
 */
export async function createMigratedVersionsFile({
    absolutePathToVersions,
    outputPath,
    context
}: {
    absolutePathToVersions: AbsoluteFilePath;
    outputPath?: AbsoluteFilePath;
    context: TaskContext;
}): Promise<AbsoluteFilePath> {
    const fileContent = await readFile(absolutePathToVersions, "utf-8");
    const lines = fileContent.split("\n");

    // Remove version lines while preserving formatting and comments
    const migratedLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === undefined) {
            continue;
        }

        const trimmed = line.trim();

        // Skip lines that start with "version:" or "- version:"
        if (/^-?\s*version:\s/.test(trimmed)) {
            continue;
        }

        migratedLines.push(line);
    }

    // Add a comment explaining the change at the top (after the schema comment)
    const schemaCommentIndex = migratedLines.findIndex((line) => line.includes("yaml-language-server"));
    const insertIndex = schemaCommentIndex >= 0 ? schemaCommentIndex + 1 : 0;

    const migrationComment = [
        "# Versions are now computed automatically based on changelogEntry types:",
        "# - break: MAJOR version bump",
        "# - feat: MINOR version bump",
        "# - fix, chore, internal: PATCH version bump",
        ""
    ];

    migratedLines.splice(insertIndex, 0, ...migrationComment);

    const migratedContent = migratedLines.join("\n");
    const finalOutputPath = outputPath || ((absolutePathToVersions + ".migrated") as AbsoluteFilePath);

    await writeFile(finalOutputPath, migratedContent, "utf-8");

    context.logger.info(`Migrated versions file created: ${finalOutputPath}`);
    return finalOutputPath;
}

/**
 * Prints a detailed migration analysis report
 */
export function printMigrationAnalysis(analysis: MigrationAnalysis, context: TaskContext): void {
    context.logger.info(chalk.bold("\n🔍 Version Migration Analysis"));
    context.logger.info(chalk.gray("=".repeat(50)));

    context.logger.info(`📊 Total entries: ${analysis.totalEntries}`);
    context.logger.info(`📝 Entries with explicit versions: ${analysis.entriesWithExplicitVersions}`);
    context.logger.info(`✅ Correct computations: ${analysis.entriesWithCorrectComputation}`);
    context.logger.info(`❌ Incorrect computations: ${analysis.entriesWithIncorrectComputation}`);

    if (analysis.canRemoveAllVersions) {
        context.logger.info(chalk.green("\n✨ Migration Status: READY"));
    } else {
        context.logger.info(chalk.yellow("\n⚠️  Migration Status: NEEDS REVIEW"));
    }

    context.logger.info(chalk.bold("\n💡 Recommendations:"));
    for (const recommendation of analysis.recommendations) {
        context.logger.info(`  ${recommendation}`);
    }

    // Show detailed analysis for problematic entries
    const problematicEntries = analysis.analyses.filter((a) => a.hasExplicitVersion && !a.isComputedCorrect);

    if (problematicEntries.length > 0) {
        context.logger.info(chalk.bold("\n🔍 Detailed Analysis of Mismatched Versions:"));
        for (const entry of problematicEntries) {
            context.logger.info(chalk.red(`\n  Version ${entry.version}:`));
            context.logger.info(`    Computed version: ${entry.computedVersion}`);
            context.logger.info(`    Changelog types: [${entry.changelogTypes.join(", ")}]`);
            context.logger.info(`    Version bump: ${entry.versionBump}`);
        }
    }
}
