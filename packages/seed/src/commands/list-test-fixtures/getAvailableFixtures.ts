import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";

/**
 * Language-specific fixture prefixes. Fixtures starting with these prefixes
 * are only available for generators whose workspace name starts with the same prefix.
 */
export const LANGUAGE_SPECIFIC_FIXTURE_PREFIXES = ["csharp", "go", "java", "python", "ruby", "ts"];

/**
 * Get all available fixtures for a generator, optionally including output folders.
 * This function lazily imports FIXTURES to avoid file system operations at module load time.
 *
 * @param generator - The generator workspace to get fixtures for
 * @param withOutputFolders - If true, include output folders in format "fixture:outputFolder"
 * @returns Array of fixture names (or fixture:outputFolder if withOutputFolders is true)
 */
export function getAvailableFixtures(generator: GeneratorWorkspace, withOutputFolders: boolean): string[] {
    // Lazy import to avoid file system scan at module load time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { FIXTURES } = require("../test/testWorkspaceFixtures");
    return getAvailableFixturesFromList(generator, FIXTURES, withOutputFolders);
}

/**
 * Get available fixtures from a provided list (useful for testing).
 *
 * @param generator - The generator workspace to get fixtures for
 * @param allFixtures - The list of all available fixtures
 * @param withOutputFolders - If true, include output folders in format "fixture:outputFolder"
 * @returns Array of fixture names (or fixture:outputFolder if withOutputFolders is true)
 */
export function getAvailableFixturesFromList(
    generator: GeneratorWorkspace,
    allFixtures: string[],
    withOutputFolders: boolean
): string[] {
    // Get all available fixtures, filtering out language-specific ones that don't match this generator
    const availableFixtures = allFixtures.filter((fixture) => {
        const matchingPrefix = LANGUAGE_SPECIFIC_FIXTURE_PREFIXES.filter((prefix) => fixture.startsWith(prefix))[0];
        return matchingPrefix == null || generator.workspaceName.startsWith(matchingPrefix);
    });

    // Optionally, include output folders in format fixture:outputFolder
    if (withOutputFolders) {
        const allOptions: string[] = [];
        for (const fixture of availableFixtures) {
            const config = generator.workspaceConfig.fixtures?.[fixture];
            if (config != null && config.length > 0) {
                // This fixture has subfolders, add as fixture:outputFolder
                for (const outputFolder of config.map((c) => c.outputFolder)) {
                    allOptions.push(`${fixture}:${outputFolder}`);
                }
            } else {
                // This fixture has no subfolders, keep as is
                allOptions.push(fixture);
            }
        }
        return allOptions;
    }

    // Don't include subfolders, return the original fixtures
    return availableFixtures;
}

/**
 * A group of fixtures for parallel test execution.
 */
export interface FixtureGroup {
    fixtures: string[];
}

/**
 * Parse the base fixture name from a fixture string.
 * For "exhaustive:config-a", returns "exhaustive".
 * For "alias", returns "alias".
 */
export function getBaseFixtureName(fixture: string): string {
    const colonIndex = fixture.indexOf(":");
    return colonIndex >= 0 ? fixture.substring(0, colonIndex) : fixture;
}

/**
 * Calculate the weight of each fixture based on its base fixture's variant count.
 * Fixtures belonging to a base fixture with many variants are weighted higher,
 * reflecting that multi-variant fixtures tend to be more complex and slower to run.
 *
 * @param fixtures - Array of fixture names (may include "fixture:outputFolder" format)
 * @returns Map from fixture name to its weight
 */
export function getFixtureWeights(fixtures: string[]): Map<string, number> {
    // Count variants per base fixture
    const variantCounts = new Map<string, number>();
    for (const fixture of fixtures) {
        const base = getBaseFixtureName(fixture);
        variantCounts.set(base, (variantCounts.get(base) ?? 0) + 1);
    }

    // Weight each fixture by its base fixture's variant count
    const weights = new Map<string, number>();
    for (const fixture of fixtures) {
        const base = getBaseFixtureName(fixture);
        weights.set(fixture, variantCounts.get(base) ?? 1);
    }

    return weights;
}

/**
 * Calculate the recommended number of groups for a generator based on fixture count.
 * Uses a heuristic: 1 group per 10 fixtures, with a minimum of 1 and maximum of 15.
 * Returns 0 if the fixture count is small enough to run in a single job.
 *
 * @param fixtureCount - Number of fixtures for the generator
 * @returns Recommended number of groups (0 means run all in single job)
 */
export function calculateRecommendedGroups(fixtureCount: number): number {
    // If fixture count is small, run all in a single job
    if (fixtureCount <= 20) {
        return 0;
    }

    // Calculate groups: 1 group per 10 fixtures, min 2, max 15
    const groups = Math.ceil(fixtureCount / 10);
    return Math.min(Math.max(groups, 2), 15);
}

/**
 * Split fixtures into groups for parallel test execution using weight-balanced
 * bin-packing. Each fixture is weighted by its base fixture's variant count,
 * so fixtures with many variants (which tend to be more complex) are distributed
 * evenly across groups. This prevents CI imbalance where one job gets all the
 * heavy fixtures and takes much longer than others.
 *
 * Uses a greedy LPT (Longest Processing Time) algorithm: fixtures are sorted by
 * weight descending, then each is assigned to the group with the lowest current
 * total weight.
 *
 * If numGroups is 0 or fixtures.length <= 20, returns a single group with ["all"].
 *
 * @param fixtures - Array of fixture names to split
 * @param numGroups - Number of groups to split into (0 means single group, -1 means auto-calculate)
 * @returns Array of fixture groups
 */
export function splitFixturesIntoGroups(fixtures: string[], numGroups: number): FixtureGroup[] {
    // Auto-calculate groups if numGroups is -1
    const effectiveNumGroups = numGroups === -1 ? calculateRecommendedGroups(fixtures.length) : numGroups;

    // If number-of-groups is not set or is 0, or fixture count is small, run all tests in a single runner
    if (effectiveNumGroups === 0 || fixtures.length <= 20) {
        return [{ fixtures: ["all"] }];
    }

    // Calculate weight for each fixture based on its base fixture's variant count
    const weights = getFixtureWeights(fixtures);

    // Create indexed fixture list sorted by weight descending (LPT scheduling)
    // For equal weights, preserve original order for determinism
    const indexedFixtures = fixtures.map((fixture, index) => ({
        fixture,
        weight: weights.get(fixture) ?? 1,
        originalIndex: index
    }));
    indexedFixtures.sort((a, b) => b.weight - a.weight || a.originalIndex - b.originalIndex);

    // Initialize groups with weight tracking
    const groups: { fixtures: string[]; totalWeight: number }[] = [];
    for (let i = 0; i < effectiveNumGroups; i++) {
        groups.push({ fixtures: [], totalWeight: 0 });
    }

    // Greedy bin-packing: assign each fixture to the group with lowest total weight
    for (const { fixture, weight } of indexedFixtures) {
        let lightestIdx = 0;
        for (let i = 1; i < groups.length; i++) {
            const current = groups[i];
            const lightest = groups[lightestIdx];
            if (current != null && lightest != null && current.totalWeight < lightest.totalWeight) {
                lightestIdx = i;
            }
        }
        const targetGroup = groups[lightestIdx];
        if (targetGroup != null) {
            targetGroup.fixtures.push(fixture);
            targetGroup.totalWeight += weight;
        }
    }

    // Filter out empty groups and return fixture lists only
    return groups.filter((g) => g.fixtures.length > 0).map((g) => ({ fixtures: g.fixtures }));
}
