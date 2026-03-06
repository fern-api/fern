import { execSync } from "child_process";
import path from "path";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces.js";

/**
 * Result of affected detection — which generators and fixtures need to run.
 */
export interface AffectedResult {
    /** If true, ALL generators are affected (e.g. IR/seed infrastructure changed) */
    allGeneratorsAffected: boolean;
    /** If true, ALL fixtures are affected for the affected generators */
    allFixturesAffected: boolean;
    /** Specific generator workspace names that are affected (empty if allGeneratorsAffected) */
    affectedGenerators: string[];
    /** Specific fixture names that are affected (empty if allFixturesAffected) */
    affectedFixtures: string[];
    /** Summary of what was detected, for logging */
    summary: string[];
}

/**
 * Paths that, when changed, affect ALL generators and ALL fixtures.
 * These are infrastructure-level changes.
 */
const GLOBAL_AFFECT_PATHS = ["packages/ir-sdk/", "packages/seed/", "packages/cli/generation/ir-generator/"];

/**
 * Paths for test definitions. Changes here affect specific fixtures.
 */
const TEST_DEFINITION_PATHS = ["test-definitions/fern/apis/", "test-definitions-openapi/fern/apis/"];

/**
 * Maps generator workspace names to their source code paths.
 * When files under these paths change, the corresponding generator is affected.
 */
const GENERATOR_SOURCE_PATHS: Record<string, string[]> = {
    "ts-sdk": ["generators/typescript/", "generators/typescript-v2/"],
    "ts-express": ["generators/typescript/", "generators/typescript-v2/"],
    "python-sdk": ["generators/python/", "generators/python-v2/"],
    pydantic: ["generators/python/", "generators/python-v2/"],
    "pydantic-v2": ["generators/python-v2/"],
    fastapi: ["generators/python/", "generators/python-v2/"],
    "java-sdk": ["generators/java/", "generators/java-v2/"],
    "java-model": ["generators/java/", "generators/java-v2/"],
    "java-spring": ["generators/java/", "generators/java-v2/"],
    "go-sdk": ["generators/go/", "generators/go-v2/"],
    "go-model": ["generators/go/", "generators/go-v2/"],
    "ruby-sdk-v2": ["generators/ruby-v2/"],
    "csharp-sdk": ["generators/csharp/"],
    "csharp-model": ["generators/csharp/"],
    "php-sdk": ["generators/php/"],
    "php-model": ["generators/php/"],
    "swift-sdk": ["generators/swift/"],
    "rust-sdk": ["generators/rust/"],
    "rust-model": ["generators/rust/"],
    openapi: ["generators/openapi/"],
    postman: ["generators/postman/"]
};

/**
 * Get the list of changed files by running git diff against a base ref.
 *
 * @param baseRef - The git ref to diff against (e.g. "origin/main", a SHA, etc.)
 *                  If not provided, defaults to "origin/main"
 * @param repoRoot - The root directory of the repository
 * @returns Array of changed file paths relative to the repo root
 */
export function getChangedFiles(baseRef: string, repoRoot: string): string[] {
    try {
        const output = execSync(`git diff --name-only --merge-base ${baseRef}`, {
            cwd: repoRoot,
            encoding: "utf-8",
            timeout: 30000
        });
        return output
            .trim()
            .split("\n")
            .filter((line) => line.length > 0);
    } catch {
        // Fallback: try without --merge-base (for cases where merge-base doesn't work)
        try {
            const output = execSync(`git diff --name-only ${baseRef}`, {
                cwd: repoRoot,
                encoding: "utf-8",
                timeout: 30000
            });
            return output
                .trim()
                .split("\n")
                .filter((line) => line.length > 0);
        } catch {
            console.error("Failed to get changed files from git. Falling back to running everything.");
            return [];
        }
    }
}

/**
 * Detect which generators and fixtures are affected based on changed files.
 *
 * @param changedFiles - Array of changed file paths relative to repo root
 * @param allGenerators - All available generator workspaces
 * @returns AffectedResult describing what needs to run
 */
export function detectAffected(changedFiles: string[], allGenerators: GeneratorWorkspace[]): AffectedResult {
    const summary: string[] = [];
    const affectedGeneratorSet = new Set<string>();
    const affectedFixtureSet = new Set<string>();
    let allGeneratorsAffected = false;
    let allFixturesAffected = false;

    if (changedFiles.length === 0) {
        summary.push("No changed files detected — running everything as fallback.");
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            affectedFixtures: [],
            summary
        };
    }

    // Check for global infrastructure changes
    for (const file of changedFiles) {
        for (const globalPath of GLOBAL_AFFECT_PATHS) {
            if (file.startsWith(globalPath)) {
                allGeneratorsAffected = true;
                allFixturesAffected = true;
                summary.push(`Global infrastructure change detected: ${file}`);
                break;
            }
        }
        if (allGeneratorsAffected) {
            break;
        }
    }

    // If global changes detected, we're done — everything needs to run
    if (allGeneratorsAffected && allFixturesAffected) {
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            affectedFixtures: [],
            summary
        };
    }

    // Check for test definition changes → specific fixtures affected
    for (const file of changedFiles) {
        for (const testDefPath of TEST_DEFINITION_PATHS) {
            if (file.startsWith(testDefPath)) {
                // Extract fixture name from path like "test-definitions/fern/apis/<fixture-name>/..."
                const relativePath = file.slice(testDefPath.length);
                const fixtureName = relativePath.split("/")[0];
                if (fixtureName != null && fixtureName.length > 0) {
                    affectedFixtureSet.add(fixtureName);
                    summary.push(`Test definition changed: ${fixtureName} (from ${file})`);
                }
            }
        }
    }

    // Check for generator source changes → specific generators affected
    const allGeneratorNames = allGenerators.map((g) => g.workspaceName);
    for (const file of changedFiles) {
        for (const [generatorName, sourcePaths] of Object.entries(GENERATOR_SOURCE_PATHS)) {
            // Only consider generators that actually exist
            if (!allGeneratorNames.includes(generatorName)) {
                continue;
            }
            for (const sourcePath of sourcePaths) {
                if (file.startsWith(sourcePath)) {
                    affectedGeneratorSet.add(generatorName);
                    summary.push(`Generator source changed: ${generatorName} (from ${file})`);
                    break;
                }
            }
        }

        // Also check for seed.yml changes → that specific generator is affected
        if (file.startsWith("seed/") && file.endsWith("/seed.yml")) {
            // Extract generator name from path like "seed/<generator>/seed.yml"
            const parts = file.split("/");
            if (parts.length >= 2) {
                const generatorName = parts[1];
                if (generatorName != null && allGeneratorNames.includes(generatorName)) {
                    affectedGeneratorSet.add(generatorName);
                    allFixturesAffected = true;
                    summary.push(`seed.yml changed for generator: ${generatorName}`);
                }
            }
        }
    }

    // If test definitions changed but no specific generators, all generators are affected
    // (since test definitions feed into all generators)
    if (affectedFixtureSet.size > 0 && affectedGeneratorSet.size === 0) {
        allGeneratorsAffected = true;
        summary.push(
            "Test definitions changed but no generator source changed — all generators affected for changed fixtures."
        );
    }

    // If generator source changed but no specific fixtures, all fixtures are affected for those generators
    if (affectedGeneratorSet.size > 0 && affectedFixtureSet.size === 0) {
        allFixturesAffected = true;
        summary.push(
            "Generator source changed but no test definitions changed — all fixtures affected for changed generators."
        );
    }

    // If nothing was detected as affected, fall back to running everything
    if (!allGeneratorsAffected && affectedGeneratorSet.size === 0 && affectedFixtureSet.size === 0) {
        summary.push("No recognized changes detected — running everything as fallback.");
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            affectedFixtures: [],
            summary
        };
    }

    return {
        allGeneratorsAffected,
        allFixturesAffected,
        affectedGenerators: [...affectedGeneratorSet],
        affectedFixtures: [...affectedFixtureSet],
        summary
    };
}

/**
 * Resolve affected generators to actual GeneratorWorkspace objects.
 * Returns the filtered list of generators that need to run.
 */
export function resolveAffectedGenerators(
    affected: AffectedResult,
    allGenerators: GeneratorWorkspace[]
): GeneratorWorkspace[] {
    if (affected.allGeneratorsAffected) {
        return allGenerators;
    }
    return allGenerators.filter((g) => affected.affectedGenerators.includes(g.workspaceName));
}

/**
 * Resolve affected fixtures for a given generator.
 * Returns the filtered list of fixture names that need to run.
 */
export function resolveAffectedFixtures(affected: AffectedResult, availableFixtures: string[]): string[] {
    if (affected.allFixturesAffected) {
        return availableFixtures;
    }
    return availableFixtures.filter((f) => {
        // Handle "fixture:outputFolder" format
        const fixtureName = f.includes(":") ? f.split(":")[0] : f;
        return fixtureName != null && affected.affectedFixtures.includes(fixtureName);
    });
}

/**
 * Find the repository root by looking for the .git directory.
 */
export function findRepoRoot(): string {
    try {
        const root = execSync("git rev-parse --show-toplevel", {
            encoding: "utf-8",
            timeout: 5000
        }).trim();
        return root;
    } catch {
        return process.cwd();
    }
}
