import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { NpmPackage } from "./NpmPackage";

export function constructNpmPackage(generatorConfig: FernGeneratorExec.GeneratorConfig): NpmPackage {
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
                      packageCoordinate: FernGeneratorExec.PackageCoordinate.npm({
                          name: packageName,
                          version: generatorConfig.publish.version,
                      }),
                  }
                : undefined,
    };
}
