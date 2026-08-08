import { FernSeedConfig } from "./config/index.js";

/**
 * Generation wipes a fixture's output folder before writing files, so a configuration
 * that writes to the fixture root ("." ) destroys the output of any sibling configuration
 * nested underneath it.
 */
export function validateFixtureOutputFolders({
    workspaceName,
    workspaceConfig
}: {
    workspaceName: string;
    workspaceConfig: FernSeedConfig.SeedWorkspaceConfiguration;
}): string[] {
    const errors: string[] = [];
    for (const [fixture, configurations] of Object.entries(workspaceConfig.fixtures ?? {})) {
        const outputFolders = configurations.map((configuration) => configuration.outputFolder);
        if (outputFolders.length > 1 && outputFolders.includes(".")) {
            errors.push(
                `${workspaceName}: fixture "${fixture}" has an outputFolder of "." alongside ${outputFolders
                    .filter((outputFolder) => outputFolder !== ".")
                    .map((outputFolder) => `"${outputFolder}"`)
                    .join(", ")}. ` +
                    `Give every configuration its own output folder so they do not overwrite each other.`
            );
        }
    }
    return errors;
}
