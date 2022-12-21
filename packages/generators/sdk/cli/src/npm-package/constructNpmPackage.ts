import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import { NpmPackage } from "./NpmPackage";

export function constructNpmPackage(generatorConfig: FernGeneratorExec.GeneratorConfig): NpmPackage {
    const outputMode = generatorConfig.output.mode;
    switch (outputMode.type) {
        case "downloadFiles":
            return {
                packageName: `@${generatorConfig.organization}/${generatorConfig.workspaceName}`,
                version: "0.0.0",
                publishInfo: undefined,
                repoUrl: undefined,
            };
        case "publish":
            return {
                packageName: outputMode.registriesV2.npm.packageName,
                version: outputMode.version,
                publishInfo: {
                    registry: outputMode.registriesV2.npm,
                    packageCoordinate: FernGeneratorExec.PackageCoordinate.npm({
                        name: outputMode.registriesV2.npm.packageName,
                        version: outputMode.version,
                    }),
                },
                repoUrl: undefined,
            };
        case "github":
            if (outputMode.publishInfo != null && outputMode.publishInfo.type !== "npm") {
                throw new Error(
                    `Expected to receive npm publish info but received ${outputMode.publishInfo.type} instead`
                );
            }
            return {
                packageName: outputMode.publishInfo != null ? outputMode.publishInfo.packageName : "",
                version: outputMode.version,
                publishInfo: undefined,
                repoUrl: outputMode.repoUrl,
            };
        default:
            throw new Error(`Encountered unknown output mode: ${outputMode.type}`);
    }
}
