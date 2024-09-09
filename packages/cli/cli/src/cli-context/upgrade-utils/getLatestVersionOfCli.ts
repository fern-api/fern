import { FernRegistry, FernRegistryClient as GeneratorsClient } from "@fern-fern/generators-sdk";
import { CliEnvironment } from "../CliEnvironment";

export async function getLatestVersionOfCli({
    cliEnvironment,
    includePreReleases = false
}: {
    cliEnvironment: CliEnvironment;
    includePreReleases?: boolean;
}): Promise<string> {
    // when running a non-published version of the CLI (e.g. in ETE tests),
    // don't try to upgrade
    if (cliEnvironment.packageVersion === "0.0.0") {
        return cliEnvironment.packageVersion;
    }
    const client = new GeneratorsClient({
        environment: process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
    });

    const latestReleaseResponse = await client.generators.cli.getLatestCliRelease({
        releaseTypes: [
            includePreReleases ? FernRegistry.generators.ReleaseType.Rc : FernRegistry.generators.ReleaseType.Ga
        ]
    });

    if (latestReleaseResponse.ok) {
        return latestReleaseResponse.body.version;
    }
    throw new Error(`Failed to get latest version of CLI: ${JSON.stringify(latestReleaseResponse.error)}`);
}
