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
 * Paths that, when changed, affect ALL generators and ALL fixtures.
 * These are infrastructure-level changes that turbo cannot detect
 * (generators depend on the published npm @fern-fern/ir-sdk, not the local workspace).
 */
const GLOBAL_AFFECT_PATHS = ["packages/ir-sdk/", "packages/seed/", "packages/cli/generation/ir-generator/"];

/**
 * Extended global paths used when turbo is unavailable as fallback.
 * Includes shared base packages that turbo would normally handle via dependency graph.
 */
const GLOBAL_AFFECT_PATHS_WITH_BASE = [
    ...GLOBAL_AFFECT_PATHS,
    "generators/base/",
    "generators/browser-compatible-base/"
];

/**
 * Paths for test definitions. Changes here affect specific fixtures.
 */
const TEST_DEFINITION_PATHS = ["test-definitions/fern/apis/", "test-definitions-openapi/fern/apis/"];

/**
 * Maps generator directory prefixes (under generators/) to seed workspace names.
 * Used to convert turbo's affected package paths to seed workspace names.
 * Turbo handles transitive dependencies automatically (e.g. generators/base/ changes
 * will cause all dependent generator packages to appear as affected).
 */
const GENERATOR_DIR_TO_SEED_WORKSPACES: Record<string, string[]> = {
    typescript: ["ts-sdk", "ts-express"],
    "typescript-v2": ["ts-sdk", "ts-express"],
    python: ["python-sdk", "pydantic", "fastapi"],
    "python-v2": ["python-sdk", "pydantic", "pydantic-v2", "fastapi"],
    java: ["java-sdk", "java-model", "java-spring"],
    "java-v2": ["java-sdk", "java-model", "java-spring"],
    go: ["go-sdk", "go-model"],
    "go-v2": ["go-sdk", "go-model"],
    "ruby-v2": ["ruby-sdk", "ruby-sdk-v2"],
    csharp: ["csharp-sdk", "csharp-model"],
    php: ["php-sdk", "php-model"],
    swift: ["swift-sdk"],
    rust: ["rust-sdk", "rust-model"],
    openapi: ["openapi"],
    postman: ["postman"]
};

/**
 * Fallback: Maps generator workspace names to their source code paths.
 * Used when turbo detection is not available.
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
    openapi: ["generators/openapi/"],
    postman: ["generators/postman/"]
};

export interface TurboPackage {
    name: string;
    path: string;
}

interface TurboLsOutput {
    packages: {
        count: number;
        items: TurboPackage[];
    };
}

/**
 * Get affected packages using turbo's built-in dependency graph analysis.
 * Turbo automatically resolves transitive dependencies, so if a shared base package
 * (like generators/base/) changes, all dependent generator packages are reported.
 *
 * @param repoRoot - The root directory of the repository
 * @param baseRef - The git ref to diff against (passed via TURBO_SCM_BASE env var)
 * @returns Array of affected packages, or null if turbo detection fails
 */
export function getTurboAffectedPackages(repoRoot: string, baseRef: string): TurboPackage[] | null {
    try {
        const output = execFileSync("pnpm", ["turbo", "ls", "--affected", "--output=json"], {
            cwd: repoRoot,
            encoding: "utf-8",
            timeout: 60000,
            env: {
                ...process.env,
                TURBO_SCM_BASE: baseRef
            }
        });

        // turbo may output non-JSON lines (e.g. update notices) before the JSON
        const jsonStart = output.indexOf("{");
        if (jsonStart === -1) {
            console.error("No JSON found in turbo output");
            return null;
        }

        const parsed = JSON.parse(output.slice(jsonStart)) as TurboLsOutput;
        return parsed.packages.items;
    } catch (error) {
        console.error("turbo ls --affected failed, falling back to git diff detection:", error);
        return null;
    }
}

/**
 * Map turbo affected package paths to seed workspace names.
 */
function mapTurboPackagesToSeedWorkspaces(
    turboPackages: TurboPackage[],
    allGeneratorNames: string[]
): {
    affectedGenerators: Set<string>;
    allGeneratorsAffected: boolean;
    allFixturesAffected: boolean;
    summary: string[];
} {
    const affectedGenerators = new Set<string>();
    const summary: string[] = [];
    let allGeneratorsAffected = false;
    let allFixturesAffected = false;

    for (const pkg of turboPackages) {
        // Check if this is a global infrastructure package
        for (const globalPath of GLOBAL_AFFECT_PATHS) {
            if (pkg.path === globalPath.replace(/\/$/, "") || pkg.path.startsWith(globalPath)) {
                allGeneratorsAffected = true;
                allFixturesAffected = true;
                summary.push(`Global infrastructure package affected (turbo): ${pkg.name} (${pkg.path})`);
                break;
            }
        }

        // Check if this is a generator package
        if (pkg.path.startsWith("generators/")) {
            const parts = pkg.path.split("/");
            if (parts.length >= 2) {
                const generatorDir = parts[1];
                if (generatorDir != null) {
                    const seedWorkspaces = GENERATOR_DIR_TO_SEED_WORKSPACES[generatorDir];
                    if (seedWorkspaces != null) {
                        for (const workspace of seedWorkspaces) {
                            if (allGeneratorNames.includes(workspace)) {
                                affectedGenerators.add(workspace);
                            }
                        }
                        summary.push(`Generator package affected (turbo): ${pkg.name} -> ${seedWorkspaces.join(", ")}`);
                    }
                }
            }
        }
    }

    return { affectedGenerators, allGeneratorsAffected, allFixturesAffected, summary };
}

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
        // Fallback: try without --merge-base (for cases where merge-base doesn't work)
        try {
            const output = execFileSync("git", ["diff", "--name-only", baseRef], {
                cwd: repoRoot,
                encoding: "utf-8",
                timeout: 30000
            });
            return output
                .trim()
                .split("\n")
                .filter((line) => line.length > 0);
        } catch (innerError) {
            console.error("Failed to get changed files from git. Falling back to running everything.", innerError);
            return [];
        }
    }
}

/**
 * Detect which generators and fixtures are affected based on changed files.
 * Uses turbo for generator detection when available (handles transitive dependencies
 * like generators/base/ automatically), with git diff path matching as fallback.
 * Always uses git diff for test definitions and seed.yml changes.
 *
 * @param changedFiles - Array of changed file paths relative to repo root
 * @param allGenerators - All available generator workspaces
 * @param turboPackages - Optional turbo affected packages (null if turbo unavailable)
 * @returns AffectedResult describing what needs to run
 */
export function detectAffected(
    changedFiles: string[],
    allGenerators: GeneratorWorkspace[],
    turboPackages?: TurboPackage[] | null
): AffectedResult {
    const summary: string[] = [];
    const affectedGeneratorSet = new Set<string>();
    const affectedFixtureSet = new Set<string>();
    let allGeneratorsAffected = false;
    let allFixturesAffected = false;
    const allGeneratorNames = allGenerators.map((g) => g.workspaceName);

    if (changedFiles.length === 0 && (turboPackages == null || turboPackages.length === 0)) {
        summary.push("No changed files detected — running everything as fallback.");
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
            affectedGenerators: [],
            generatorsWithAllFixtures: [],
            affectedFixtures: [],
            summary
        };
    }

    // === GENERATOR DETECTION ===
    // Use turbo if available (handles transitive deps like generators/base/ automatically)
    if (turboPackages != null) {
        summary.push("Using turbo for generator affected detection (transitive dependency support).");
        const turboResult = mapTurboPackagesToSeedWorkspaces(turboPackages, allGeneratorNames);
        if (turboResult.allGeneratorsAffected) {
            allGeneratorsAffected = true;
        }
        if (turboResult.allFixturesAffected) {
            allFixturesAffected = true;
        }
        for (const gen of turboResult.affectedGenerators) {
            affectedGeneratorSet.add(gen);
        }
        summary.push(...turboResult.summary);
    }

    // Check git diff for infrastructure paths
    // (needed even with turbo because generators depend on published @fern-fern/ir-sdk,
    // not the local workspace, so turbo won't detect ir-sdk changes as affecting generators)
    const globalPaths = turboPackages != null ? GLOBAL_AFFECT_PATHS : GLOBAL_AFFECT_PATHS_WITH_BASE;
    for (const file of changedFiles) {
        for (const globalPath of globalPaths) {
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

    // === FALLBACK GENERATOR DETECTION (git diff, only when turbo unavailable) ===
    if (turboPackages == null) {
        summary.push("Turbo unavailable — using git diff for generator detection.");
        for (const file of changedFiles) {
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

    // If nothing was detected as affected, fall back to running everything
    if (!allGeneratorsAffected && affectedGeneratorSet.size === 0 && affectedFixtureSet.size === 0) {
        summary.push("No recognized changes detected — running everything as fallback.");
        return {
            allGeneratorsAffected: true,
            allFixturesAffected: true,
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
