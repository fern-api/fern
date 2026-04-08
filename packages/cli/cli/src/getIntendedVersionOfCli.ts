import { getFernDirectory, loadProjectConfig } from "@fern-api/configuration-loader";
import { CliContext } from "./cli-context/CliContext.js";
import { getLatestVersionOfCli } from "./cli-context/upgrade-utils/getLatestVersionOfCli.js";

export async function getIntendedVersionOfCli(cliContext: CliContext): Promise<string> {
    if (process.env.FERN_NO_VERSION_REDIRECTION === "true") {
        return cliContext.environment.packageVersion;
    }
    if (process.env.FERN_RESOLVE_VERSION && process.env.FERN_RESOLVE_VERSION !== "auto") {
        const resolveVersion = process.env.FERN_RESOLVE_VERSION;
        if (resolveVersion === "inherit") {
            return cliContext.environment.packageVersion;
        }
        if (resolveVersion === "latest") {
            return getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
        }
        cliContext.logger.info(`Resolving Fern CLI to version '${resolveVersion}' via FERN_RESOLVE_VERSION.`);
        return resolveVersion;
    }
    const fernDirectory = await getFernDirectory();
    if (fernDirectory != null) {
        const projectConfig = await cliContext.runTask((context) =>
            loadProjectConfig({ directory: fernDirectory, context })
        );
        if (projectConfig.version === "*") {
            return cliContext.environment.packageVersion;
        }
        if (projectConfig.version === "latest") {
            return getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
        }
        return projectConfig.version;
    }
    return getLatestVersionOfCli({ cliEnvironment: cliContext.environment });
}
