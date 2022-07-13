import { PackageCoordinate } from "@fern-fern/generator-logging-api-client/model";
import { FernTypescriptGeneratorConfig } from "../generator/FernGeneratorConfig";
import { Command } from "./Command";

export interface NpmPackage {
    scope: string;
    packageName: string;
    fullPackageName: string;
    packageCoordinate: PackageCoordinate | undefined;
}

export function getCommandPackageCoordinate({
    command,
    config,
}: {
    command: Command<string>;
    config: FernTypescriptGeneratorConfig;
}): NpmPackage {
    const scope = config.organization;
    const packageName = `${config.workspaceName}-${command.key}`;
    const fullPackageName = `@${scope}/${packageName}`;
    return {
        scope,
        packageName,
        fullPackageName,
        packageCoordinate:
            config.publish != null
                ? PackageCoordinate.npm({
                      name: fullPackageName,
                      version: config.publish.version,
                  })
                : undefined,
    };
}
