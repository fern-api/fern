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
 * Split fixtures into groups for parallel test execution.
 * If numGroups is 0 or fixtures.length <= 20, returns a single group with ["all"].
 *
 * @param fixtures - Array of fixture names to split
 * @param numGroups - Number of groups to split into (0 means single group)
 * @returns Array of fixture groups
 */
export function splitFixturesIntoGroups(fixtures: string[], numGroups: number): FixtureGroup[] {
    // If number-of-groups is not set or is 0, or fixture count is small, run all tests in a single runner
    if (numGroups === 0 || fixtures.length <= 20) {
        return [{ fixtures: ["all"] }];
    }

    // Calculate fixtures per group (ceiling division)
    const fixturesPerGroup = Math.ceil(fixtures.length / numGroups);

    // Create groups by splitting fixtures evenly
    const groups: FixtureGroup[] = [];
    for (let i = 0; i < numGroups; i++) {
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
