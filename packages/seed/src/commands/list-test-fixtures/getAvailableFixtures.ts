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
 * Split fixtures into groups for parallel test execution.
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

    // Calculate fixtures per group (ceiling division)
    const fixturesPerGroup = Math.ceil(fixtures.length / effectiveNumGroups);

    // Create groups by splitting fixtures evenly
    const groups: FixtureGroup[] = [];
    for (let i = 0; i < effectiveNumGroups; i++) {
        const start = i * fixturesPerGroup;
        const end = start + fixturesPerGroup;
        const groupFixtures = fixtures.slice(start, end);

        // Skip empty groups
        if (groupFixtures.length > 0) {
            groups.push({ fixtures: groupFixtures });
        }
    }

    return groups;
}
