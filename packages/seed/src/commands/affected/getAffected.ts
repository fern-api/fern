import { execFileSync } from "child_process";

import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces.js";

/**
 * Result of affected detection — which generators and fixtures need to run.
 *
 * Supports granular per-generator fixture resolution:
 * - If a generator's source changed, it needs ALL its fixtures → listed in generatorsWithAllFixtures
 * - If a test definition changed, ALL generators need that fixture → listed in affectedFixtures
 * - When both happen, each generator gets the union: generators with source changes run all fixtures,
 *   other generators run only the changed fixtures (no unnecessary full cross-product)
 */
export interface AffectedResult {
    /** If true, ALL generators are affected (e.g. IR/seed infrastructure changed, or test defs changed) */
    allGeneratorsAffected: boolean;
    /** If true, ALL fixtures are affected for ALL generators (e.g. global infrastructure changed) */
    allFixturesAffected: boolean;
    /** Specific generator workspace names that are affected (empty if allGeneratorsAffected) */
    affectedGenerators: string[];
    /** Generators whose source code changed — these need ALL their fixtures run */
    generatorsWithAllFixtures: string[];
    /** Specific fixture names that changed — ALL generators need to run these */
    affectedFixtures: string[];
    /** Summary of what was detected, for logging */
    summary: string[];
}

/**
 * Files that should never trigger seed tests, even if they live under
 * a generator source path.  These are metadata / changelog files that
 * do not affect generated code.
 */
const IGNORED_FILENAMES = ["versions.yml"];

/**
 * Paths that, when changed, affect ALL generators and ALL fixtures.
 * These are infrastructure-level changes that feed into IR generation
 * or affect how seed tests execute. Includes:
 * - IR SDK and IR generator (the core IR pipeline)
 * - Seed CLI itself
 * - Workspace loader, API importers, Fern definition parsing (affect IR input)
 * - Configuration parsing (affects generator config)
 * - Local workspace runner (affects how generators are invoked)
 * - Shared generator base packages
 */
const GLOBAL_AFFECT_PATHS = [
    "packages/ir-sdk/",
    "packages/seed/",
    "packages/cli/generation/ir-generator/",
    "packages/cli/generation/ir-migrations/",
    "packages/cli/generation/local-generation/",
    "packages/cli/generation/source-resolver/",
    "packages/cli/generation/protoc-gen-fern/",
    "packages/cli/workspace/",
    "packages/cli/api-importers/",
    "packages/cli/fern-definition/",
    "packages/cli/configuration/",
    "generators/base/",
    "generators/browser-compatible-base/"
];

/**
 * Paths for test definitions. Changes here affect specific fixtures.
 */
const TEST_DEFINITION_PATHS = ["test-definitions/fern/apis/", "test-definitions-openapi/fern/apis/"];

/**
 * Maps docker/seed/ Dockerfiles to the generator workspaces they affect.
 * When a seed Dockerfile changes, the corresponding generators need to re-run
 * all their fixtures to verify the updated Docker image works correctly.
 */
const DOCKER_SEED_GENERATOR_PATHS: Record<string, string[]> = {
    "docker/seed/Dockerfile.java": ["java-sdk", "java-model", "java-spring"],
    "docker/seed/Dockerfile.ts": ["ts-sdk", "ts-express"],
    "docker/seed/Dockerfile.python": ["python-sdk", "pydantic", "pydantic-v2", "fastapi"],
    "docker/seed/Dockerfile.go": ["go-sdk", "go-model"],
    "docker/seed/Dockerfile.csharp": ["csharp-sdk", "csharp-model"],
    "docker/seed/Dockerfile.php": ["php-sdk", "php-model"]
};

/**
 * Maps generator workspace names to their source code paths.
 * Used to detect which generators are affected by file changes.
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
    "ruby-sdk": ["generators/ruby-v2/"],
    "ruby-sdk-v2": ["generators/ruby-v2/"],
    "csharp-sdk": ["generators/csharp/"],
    "csharp-model": ["generators/csharp/"],
    "php-sdk": ["generators/php/"],
    "php-model": ["generators/php/"],
    "swift-sdk": ["generators/swift/"],
    "rust-sdk": ["generators/rust/"],
    "rust-model": ["generators/rust/"],
    openapi: ["generators/openapi/"]
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
        const output = execFileSync("git", ["diff", "--name-only", "--merge-base", baseRef], {
            cwd: repoRoot,
            encoding: "utf-8",
            timeout: 30000
        });
        return output
            .trim()
            .split("\n")
            .filter((line) => line.length > 0);
    } catch (error) {
        console.error("git diff --merge-base failed, trying fallback:", error);
        // Fallback: try without --merge-base (for cases where merge-base doesn't work,
        // e.g. disconnected shallow commits). If this also fails, let the error propagate
        // so the CLI exits non-zero and the workflow falls back to "run everything".
        const output = execFileSync("git", ["diff", "--name-only", baseRef], {
            cwd: repoRoot,
            encoding: "utf-8",
            timeout: 30000
        });
        return output
            .trim()
            .split("\n")
            .filter((line) => line.length > 0);
    }
}

/**
 * Detect which generators and fixtures are affected based on changed files.
 * Uses git diff path matching to determine affected generators and fixtures.
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
    const allGeneratorNames = allGenerators.map((g) => g.workspaceName);

    if (changedFiles.length === 0) {
        summary.push("No changed files detected — skipping all seed tests.");
        return {
            allGeneratorsAffected: false,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary
        };
    }

    // Check git diff for infrastructure paths
    for (const file of changedFiles) {
        for (const globalPath of GLOBAL_AFFECT_PATHS) {
            if (file.startsWith(globalPath)) {
                allGeneratorsAffected = true;
                allFixturesAffected = true;
                summary.push(`Global infrastructure change detected: ${file}`);
                break;
            }
        }
        if (allGeneratorsAffected && allFixturesAffected) {
            break;
        }
    }

    // If global changes detected, we're done — everything needs to run
    if (allGeneratorsAffected && allFixturesAffected) {
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary
        };
    }

    // === FIXTURE DETECTION (always via git diff) ===
    for (const file of changedFiles) {
        for (const testDefPath of TEST_DEFINITION_PATHS) {
            if (file.startsWith(testDefPath)) {
                const relativePath = file.slice(testDefPath.length);
                const fixtureName = relativePath.split("/")[0];
                if (fixtureName != null && fixtureName.length > 0) {
                    affectedFixtureSet.add(fixtureName);
                    summary.push(`Test definition changed: ${fixtureName} (from ${file})`);
                }
            }
        }
    }

    // === GENERATOR DETECTION (git diff path matching) ===
    for (const file of changedFiles) {
        // Skip metadata files that live under generator paths but don't affect codegen
        const basename = file.split("/").pop() ?? "";
        if (IGNORED_FILENAMES.includes(basename)) {
            continue;
        }
        for (const [generatorName, sourcePaths] of Object.entries(GENERATOR_SOURCE_PATHS)) {
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
    }

    // === DOCKER SEED DOCKERFILE DETECTION ===
    // When a docker/seed/ Dockerfile changes, the generators that use that Docker
    // image need to re-run all their fixtures to verify the updated image works.
    for (const file of changedFiles) {
        if (file.startsWith("docker/seed/")) {
            if (file === "docker/seed/Dockerfile.dockerignore") {
                // The shared .dockerignore affects all seed Docker builds
                allGeneratorsAffected = true;
                allFixturesAffected = true;
                summary.push(`Seed Docker ignore changed: ${file} — affects all seed builds`);
                break;
            }
            const generators = DOCKER_SEED_GENERATOR_PATHS[file];
            if (generators != null) {
                for (const gen of generators) {
                    affectedGeneratorSet.add(gen);
                }
                summary.push(`Seed Dockerfile changed: ${file} — affects ${generators.join(", ")}`);
            }
        }
    }

    // If global changes detected from dockerignore, return early
    if (allGeneratorsAffected && allFixturesAffected) {
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary
        };
    }

    // === SEED.YML DETECTION (always via git diff) ===
    // When a generator's seed.yml changes, that generator needs all its fixtures.
    // The generator is added to affectedGeneratorSet which flows into generatorsWithAllFixtures,
    // so resolveAffectedFixtures will return all fixtures for that specific generator.
    for (const file of changedFiles) {
        if (file.startsWith("seed/") && file.endsWith("/seed.yml")) {
            const parts = file.split("/");
            if (parts.length >= 2) {
                const generatorName = parts[1];
                if (generatorName != null && allGeneratorNames.includes(generatorName)) {
                    affectedGeneratorSet.add(generatorName);
                    summary.push(`seed.yml changed for generator: ${generatorName} (needs all fixtures)`);
                }
            }
        }
    }

    // If test definitions changed, all generators need to run those specific fixtures
    if (affectedFixtureSet.size > 0) {
        allGeneratorsAffected = true;
        summary.push("Test definitions changed — all generators need to run changed fixtures.");
    }

    // Generators whose source changed need all their fixtures
    if (affectedGeneratorSet.size > 0) {
        summary.push(`Generator source changed — ${[...affectedGeneratorSet].join(", ")} need all fixtures.`);
    }

    // If nothing was detected as affected, skip all seed tests — the changes
    // are in code unrelated to generators/fixtures/seed infrastructure.
    if (!allGeneratorsAffected && affectedGeneratorSet.size === 0 && affectedFixtureSet.size === 0) {
        summary.push("No seed-related changes detected — skipping all seed tests.");
        return {
            allGeneratorsAffected: false,
            allFixturesAffected: false,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary
        };
    }

    return {
        allGeneratorsAffected,
        allFixturesAffected,
        affectedGenerators: allGeneratorsAffected ? [] : [...affectedGeneratorSet],
        generatorsWithAllFixtures: [...affectedGeneratorSet],
        affectedFixtures: allFixturesAffected ? [] : [...affectedFixtureSet],
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
 * If the generator's source changed (it's in generatorsWithAllFixtures), run ALL its fixtures.
 * Otherwise, run only the specific fixtures that changed (affectedFixtures).
 * This avoids the full cross-product when both generators and fixtures change.
 */
export function resolveAffectedFixtures(
    affected: AffectedResult,
    availableFixtures: string[],
    generatorName?: string
): string[] {
    if (affected.allFixturesAffected) {
        return availableFixtures;
    }
    // If this generator's source changed, it needs all its fixtures
    if (generatorName != null && affected.generatorsWithAllFixtures.includes(generatorName)) {
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
        const root = execFileSync("git", ["rev-parse", "--show-toplevel"], {
            encoding: "utf-8",
            timeout: 5000
        }).trim();
        return root;
    } catch (error) {
        console.error("Failed to find repo root via git, falling back to cwd:", error);
        return process.cwd();
    }
}
