import { GeneratorWorkspace } from "../../loadGeneratorWorkspaces";
import { FIXTURES, LANGUAGE_SPECIFIC_FIXTURE_PREFIXES } from "../test/testWorkspaceFixtures";

/**
 * Get all available fixtures for a generator, optionally including output folders.
 *
 * @param generator - The generator workspace to get fixtures for
 * @param withOutputFolders - If true, include output folders in format "fixture:outputFolder"
 * @returns Array of fixture names (or fixture:outputFolder if withOutputFolders is true)
 */
export function getAvailableFixtures(generator: GeneratorWorkspace, withOutputFolders: boolean): string[] {
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
