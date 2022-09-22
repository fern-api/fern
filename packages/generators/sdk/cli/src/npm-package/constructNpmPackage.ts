import { GeneratorConfig } from "@fern-fern/generator-exec-client/model/config";
import { PackageCoordinate } from "@fern-fern/generator-exec-client/model/logging";
import { NpmPackage } from "./NpmPackage";

export function constructNpmPackage(generatorConfig: GeneratorConfig): NpmPackage {
    const scope = generatorConfig.publish?.registries.npm.scope ?? generatorConfig.organization;
    const scopeWithAtSign = `@${scope}`;
    const packageNameWithoutScope = `${generatorConfig.workspaceName}-client`;
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
