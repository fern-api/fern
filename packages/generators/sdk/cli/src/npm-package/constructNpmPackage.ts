import { FernGeneratorExec } from "@fern-fern/generator-exec-client";
import { NpmPackage } from "./NpmPackage";

export function constructNpmPackage(generatorConfig: FernGeneratorExec.GeneratorConfig): NpmPackage {
    const outputMode = generatorConfig.output.mode;
    switch (outputMode.type) {
        case "downloadFiles":
            throw new Error("Output mode downloadFiles is unsupported!");
        case "publish":
            return {
                packageName: outputMode.registriesV2.npm.packageName,
                publishInfo: {
                    registry: outputMode.registriesV2.npm,
                    packageCoordinate: FernGeneratorExec.PackageCoordinate.npm({
                        name: outputMode.registriesV2.npm.packageName,
                        version: outputMode.version,
                    }),
                },
            };
        case "github":
            if (outputMode.publishInfo.type != "npm") {
                throw new Error(
                    `Expected to receive npm publish info but received ${outputMode.publishInfo.type} instead`
                );
            }
            return {
                packageName: outputMode.publishInfo.packageName,
                publishInfo: undefined,
            };
        default:
            throw new Error(`Encountered unknown output mode: ${outputMode.type}`);
    }
}
