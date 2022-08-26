import { NpmRegistryConfig } from "@fern-fern/generator-exec-client/model/config";
import { PackageCoordinate } from "@fern-fern/generator-exec-client/model/logging";
import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { CommandKey } from "./Command";

export interface NpmPackage {
    scopeWithAtSign: string;
    packageName: string;
    publishInfo: PublishInfo | undefined;
}

export interface PublishInfo {
    registry: NpmRegistryConfig;
    packageCoordinate: PackageCoordinate.Npm;
}

export function constructNpmPackage({
    commandKey,
    generatorConfig,
}: {
    commandKey: CommandKey;
    generatorConfig: FernTypescriptGeneratorConfig;
}): NpmPackage {
    const scope = generatorConfig.publish?.registries.npm.scope ?? generatorConfig.organization;
    const scopeWithAtSign = `@${scope}`;
    const packageNameWithoutScope = `${generatorConfig.workspaceName}-${commandKey}`;
    const packageName = `${scopeWithAtSign}/${packageNameWithoutScope}`;
    return {
        scopeWithAtSign,
        packageName,
        publishInfo:
            generatorConfig.publish != null
                ? {
                      registry: generatorConfig.publish.registries.npm,
                      packageCoordinate: PackageCoordinate.npm({
                          name: packageName,
                          version: generatorConfig.publish.version,
                      }),
                  }
                : undefined,
    };
}
