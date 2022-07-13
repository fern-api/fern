import { FernTypescriptGeneratorConfig } from "../generator/FernGeneratorConfig";
import { Command } from "./Command";

export interface PublishNpmPackage {
    name: string;
    publishVersion: string;
}

export interface NpmPackage {
    name: string;
    publishVersion: undefined | string;
}

export function getCommandPackageCoordinate({
    command,
    config,
}: {
    command: Command<string>;
    config: FernTypescriptGeneratorConfig;
}): NpmPackage {
    const scopeWithAtSign = `@${config.organization}`;
    return {
        name: `${scopeWithAtSign}/${config.workspaceName}-${command.key}`,
        publishVersion: config.publish?.version,
    };
}

export function isPublishNpmPackage(npmPackage: NpmPackage): npmPackage is PublishNpmPackage {
    return npmPackage.publishVersion != null;
}
