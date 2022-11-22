import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { FernTypescriptGeneratorConfig } from "@fern-typescript/commons";
import { CommandKey } from "./Command";

export interface NpmPackage {
    scopeWithAtSign: string;
    packageName: string;
    publishInfo: PublishInfo | undefined;
}

export interface PublishInfo {
    registry: FernGeneratorExec.NpmRegistryConfig;
    packageCoordinate: FernGeneratorExec.PackageCoordinate.Npm;
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
                      packageCoordinate: FernGeneratorExec.PackageCoordinate.npm({
                          name: packageName,
                          version: generatorConfig.publish.version,
                      }),
                  }
                : undefined,
    };
}
